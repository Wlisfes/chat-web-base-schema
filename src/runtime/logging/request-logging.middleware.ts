import { Logger } from '@nestjs/common'
import type { Request, RequestHandler, Response } from 'express'
import { getActiveExecutionMethod, resolveRequestId } from '@/utils/modules/request-context'
import { isBusinessSuccessStatus, parseJsonBusinessCode, resolveBusinessStatusCode } from '@/runtime/logging/business-status'
import { normalizeServiceExecutionMethod } from '@/runtime/logging/execution-method'
import { resolvePublicRequestUrl } from '@/utils/modules/request-url'
import { getActiveTraceContext } from '@/runtime/observability'

type RequestWithExecutionMethod = Request & { executionMethod?: string }

const MAX_PAYLOAD_LENGTH = 4096
const TRUNCATED_SUFFIX = '...[已截断]'
const REQUEST_BODY_CAPTURE_SYMBOL = Symbol.for('chat-web.request-body-capture')
const CAPTURABLE_CONTENT_TYPE_PATTERN = /^(application\/(?:[\w.+-]+\+)?json|application\/x-www-form-urlencoded|text\/)/i

interface RequestBodyCapture {
    chunks: Buffer[]
    length: number
    truncated: boolean
}

type RequestWithBodyCapture = RequestWithExecutionMethod & { [REQUEST_BODY_CAPTURE_SYMBOL]?: RequestBodyCapture }

export const DEFAULT_REQUEST_LOGGING_IGNORED_PATHS = [
    '/health',
    '/health/live',
    '/health/ready',
    '/favicon.ico',
    '/robots.txt',
    '/.well-known/appspecific/com.chrome.devtools.json',
    '/api/swagger',
    '/api/swagger-json',
    '/doc.html',
    '/services.json'
] as const

const ignoredPaths = new Set<string>(DEFAULT_REQUEST_LOGGING_IGNORED_PATHS)
const ignoredPathPrefixes = ['/api/swagger/']

const SENSITIVE_KEYS = new Set([
    'access_token',
    'accesstoken',
    'authorization',
    'captcha',
    'captchaid',
    'password',
    'refresh_token',
    'refreshtoken',
    'secret',
    'token'
])

/** 判断字段名是否属于需要在日志中隐藏的敏感字段。 */
export function isSensitiveLogKey(key: string): boolean {
    return SENSITIVE_KEYS.has(key.toLowerCase())
}

function sanitize(value: unknown, depth = 0): unknown {
    if (depth > 4) return '[内容层级过深]'
    if (Array.isArray(value)) return value.slice(0, 100).map(item => sanitize(item, depth + 1))
    if (!value || typeof value !== 'object') return value

    const entries = Object.entries(value)
    const containsPassword = entries.some(([key]) => key.toLowerCase() === 'password')
    return Object.fromEntries(
        entries.map(([key, item]) => {
            const normalizedKey = key.toLowerCase()
            const sensitive = SENSITIVE_KEYS.has(normalizedKey) || (containsPassword && normalizedKey === 'code')
            return [key, sensitive ? '[已隐藏]' : sanitize(item, depth + 1)]
        })
    )
}

/** 脱敏并截断日志入参，避免密码、Token 或超大请求体进入日志。 */
export function sanitizeRequestLogValue(value: unknown, maxLength = MAX_PAYLOAD_LENGTH): unknown {
    if (value === undefined) return undefined
    if (typeof value === 'string') {
        if (value.length <= maxLength || value.endsWith(TRUNCATED_SUFFIX)) return value
        return `${value.slice(0, maxLength)}${TRUNCATED_SUFFIX}`
    }
    const serialized = JSON.stringify(sanitize(value))
    if (serialized === undefined) return String(value)
    if (serialized.length <= maxLength) return JSON.parse(serialized) as unknown
    return `${serialized.slice(0, maxLength)}${TRUNCATED_SUFFIX}`
}

/**
 * 网关为流式转发关闭了 bodyParser，request.body 始终为空。
 * 这里在不改变流模式的前提下旁路复制 data 事件，最多保留 MAX_PAYLOAD_LENGTH 字节用于日志。
 */
function attachRequestBodyCapture(request: RequestWithBodyCapture): void {
    const contentType = String(request.headers['content-type'] ?? '')
    if (!CAPTURABLE_CONTENT_TYPE_PATTERN.test(contentType) || typeof request.emit !== 'function') return

    const capture: RequestBodyCapture = { chunks: [], length: 0, truncated: false }
    const originalEmit = request.emit.bind(request) as (event: string | symbol, ...args: unknown[]) => boolean
    request[REQUEST_BODY_CAPTURE_SYMBOL] = capture
    request.emit = ((event: string | symbol, ...args: unknown[]) => {
        if (event === 'data' && !capture.truncated) {
            const chunk = args[0]
            const buffer = Buffer.isBuffer(chunk) ? chunk : typeof chunk === 'string' ? Buffer.from(chunk) : undefined
            if (buffer) {
                const remaining = MAX_PAYLOAD_LENGTH - capture.length
                capture.chunks.push(buffer.subarray(0, Math.max(remaining, 0)))
                capture.length += Math.min(buffer.length, Math.max(remaining, 0))
                if (buffer.length > remaining) capture.truncated = true
            }
        }
        return originalEmit(event, ...args)
    }) as typeof request.emit
}

const SENSITIVE_TEXT_PATTERN = new RegExp(
    `("(?:${[...SENSITIVE_KEYS].join('|')})"\\s*:\\s*)("(?:\\\\.|[^"\\\\])*"?|[^,}\\s]*)|((?:^|&)(?:${[...SENSITIVE_KEYS].join('|')})=)[^&]*`,
    'gi'
)

/** 截断或无法解析的原始文本也要隐藏敏感字段，避免半截 JSON 泄露密码。 */
function redactSensitiveText(text: string): string {
    return text.replace(SENSITIVE_TEXT_PATTERN, (_match, jsonKey: string | undefined, _jsonValue, formKey: string | undefined) =>
        jsonKey ? `${jsonKey}"[已隐藏]"` : `${formKey}[已隐藏]`
    )
}

function parseCapturedBody(request: RequestWithBodyCapture): unknown {
    const capture = request[REQUEST_BODY_CAPTURE_SYMBOL]
    if (!capture || capture.length === 0) return undefined

    const text = Buffer.concat(capture.chunks).toString('utf8')
    if (capture.truncated) return `${redactSensitiveText(text)}${TRUNCATED_SUFFIX}`

    const contentType = String(request.headers['content-type'] ?? '').toLowerCase()
    try {
        if (contentType.includes('json')) return JSON.parse(text) as unknown
        if (contentType.startsWith('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(text))
    } catch {
        return redactSensitiveText(text)
    }
    return redactSensitiveText(text)
}

function resolveRequestBody(request: RequestWithBodyCapture): unknown {
    return request.body !== undefined ? request.body : parseCapturedBody(request)
}

function resolveClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for']
    const value = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]
    return value?.trim() || request.ip || request.socket.remoteAddress || ''
}

function isIgnoredPath(pathName: string): boolean {
    return ignoredPaths.has(pathName) || ignoredPathPrefixes.some(prefix => pathName.startsWith(prefix))
}

function captureResponseChunk(chunk: unknown): number | undefined {
    if (chunk === undefined || chunk === null || typeof chunk === 'function') return undefined
    const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : typeof chunk === 'string' ? chunk : ''
    return text ? parseJsonBusinessCode(text) : undefined
}

/** 包装 write/end，在未设置业务码响应头时从 JSON 响应体兜底读取 code。 */
function attachBusinessCodeCapture(response: Response, onCode: (code: number) => void): void {
    const originalWrite = typeof response.write === 'function' ? response.write.bind(response) : undefined
    const originalEnd = typeof response.end === 'function' ? response.end.bind(response) : undefined

    if (originalWrite) {
        response.write = ((chunk: unknown, encoding?: unknown, callback?: unknown) => {
            const code = captureResponseChunk(chunk)
            if (code !== undefined) onCode(code)
            return originalWrite(chunk as never, encoding as never, callback as never)
        }) as typeof response.write
    }

    if (originalEnd) {
        response.end = ((chunk?: unknown, encoding?: unknown, callback?: unknown) => {
            const code = captureResponseChunk(chunk)
            if (code !== undefined) onCode(code)
            return originalEnd(chunk as never, encoding as never, callback as never)
        }) as typeof response.end
    }
}

/** 记录与 nest-platform-service LoggerMiddleware 一致的请求、入参、来源和耗时信息。 */
export function createRequestLoggingMiddleware(serviceName: string): RequestHandler {
    const logger = new Logger(`${serviceName}:HTTP`)

    return (request, response, next) => {
        const currentRequest = request as RequestWithBodyCapture
        const startedAt = Date.now()
        const requestId = resolveRequestId(currentRequest.headers['x-request-id'])
        currentRequest.headers['x-request-id'] = requestId
        response.setHeader('x-request-id', requestId)

        let capturedCode: number | undefined
        if (!isIgnoredPath(currentRequest.path)) attachRequestBodyCapture(currentRequest)
        attachBusinessCodeCapture(response, code => {
            capturedCode = code
        })

        response.once('finish', () => {
            if (isIgnoredPath(currentRequest.path)) return
            const traceContext = getActiveTraceContext()
            const statusCode = resolveBusinessStatusCode(response, capturedCode)
            const payload = {
                message: 'HTTP请求完成',
                service: serviceName,
                logId: requestId,
                method: currentRequest.method,
                url: resolvePublicRequestUrl(currentRequest),
                statusCode,
                durationMs: Date.now() - startedAt,
                executionMethod: currentRequest.executionMethod ?? getActiveExecutionMethod(),
                ip: resolveClientIp(currentRequest),
                host: currentRequest.headers.host ?? '',
                origin: currentRequest.headers.origin ?? '',
                referer: currentRequest.headers.referer ?? '',
                userAgent: currentRequest.headers['user-agent'] ?? '',
                query: sanitizeRequestLogValue(currentRequest.query),
                params: sanitizeRequestLogValue(currentRequest.params),
                body: sanitizeRequestLogValue(resolveRequestBody(currentRequest)),
                ...traceContext
            }
            if (isBusinessSuccessStatus(statusCode)) logger.log(payload)
            else logger.error(payload)
        })
        next()
    }
}
