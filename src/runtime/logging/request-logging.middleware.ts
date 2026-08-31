import { Logger } from '@nestjs/common'
import type { Request, RequestHandler } from 'express'
import { resolveRequestId } from '@/utils/modules/request-context'
import { getActiveTraceContext } from '@/runtime/observability'

type RequestWithExecutionMethod = Request & { executionMethod?: string }

const MAX_PAYLOAD_LENGTH = 4096

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

function truncate(value: unknown, maxLength: number): unknown {
    if (value === undefined) return undefined
    const serialized = JSON.stringify(sanitize(value))
    if (serialized === undefined) return String(value)
    if (serialized.length <= maxLength) return JSON.parse(serialized) as unknown
    return `${serialized.slice(0, maxLength)}...[已截断]`
}

function resolveClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for']
    const value = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]
    return value?.trim() || request.ip || request.socket.remoteAddress || ''
}

function isIgnoredPath(path: string): boolean {
    return ignoredPaths.has(path) || ignoredPathPrefixes.some(prefix => path.startsWith(prefix))
}

/** 记录与 nest-platform-service LoggerMiddleware 一致的请求、入参、来源和耗时信息。 */
export function createRequestLoggingMiddleware(serviceName: string): RequestHandler {
    const logger = new Logger(`${serviceName}:HTTP`)

    return (request, response, next) => {
        const currentRequest = request as RequestWithExecutionMethod
        const startedAt = Date.now()
        const requestId = resolveRequestId(currentRequest.headers['x-request-id'])
        currentRequest.headers['x-request-id'] = requestId
        response.setHeader('x-request-id', requestId)

        response.once('finish', () => {
            if (isIgnoredPath(currentRequest.path)) return
            const traceContext = getActiveTraceContext()
            const payload = {
                message: 'HTTP请求完成',
                service: serviceName,
                logId: requestId,
                method: currentRequest.method,
                url: currentRequest.originalUrl,
                statusCode: response.statusCode,
                durationMs: Date.now() - startedAt,
                executionMethod: currentRequest.executionMethod,
                ip: resolveClientIp(currentRequest),
                host: currentRequest.headers.host ?? '',
                origin: currentRequest.headers.origin ?? '',
                referer: currentRequest.headers.referer ?? '',
                userAgent: currentRequest.headers['user-agent'] ?? '',
                query: truncate(currentRequest.query, MAX_PAYLOAD_LENGTH),
                params: truncate(currentRequest.params, MAX_PAYLOAD_LENGTH),
                body: truncate(currentRequest.body, MAX_PAYLOAD_LENGTH),
                ...traceContext
            }
            if (response.statusCode >= 500) logger.error(payload)
            else if (response.statusCode >= 400) logger.warn(payload)
            else logger.log(payload)
        })
        next()
    }
}
