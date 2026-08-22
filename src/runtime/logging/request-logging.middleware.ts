import { Logger } from '@nestjs/common'
import type { Request, RequestHandler } from 'express'
import { resolveRequestId } from '@/utils/modules/request-context'
import type { RequestLoggingOptions } from '@/runtime/logging/logging.interface'

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

    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, SENSITIVE_KEYS.has(key.toLowerCase()) ? '[已隐藏]' : sanitize(item, depth + 1)])
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

/** 记录与 nest-platform-service LoggerMiddleware 一致的请求、入参、来源和耗时信息。 */
export function createRequestLoggingMiddleware(options: RequestLoggingOptions): RequestHandler {
    const logger = new Logger(`${options.serviceName}:HTTP`)
    const ignoredPaths = new Set(options.ignoredPaths ?? ['/health/live'])
    const maxPayloadLength = options.maxPayloadLength ?? 4096

    return (request, response, next) => {
        const startedAt = Date.now()
        const requestId = resolveRequestId(request.headers['x-request-id'])
        request.headers['x-request-id'] = requestId
        response.setHeader('x-request-id', requestId)

        response.once('finish', () => {
            if (ignoredPaths.has(request.path)) return
            const payload = {
                service: options.serviceName,
                logId: requestId,
                requestId,
                method: request.method,
                url: request.originalUrl,
                statusCode: response.statusCode,
                durationMs: Date.now() - startedAt,
                ip: resolveClientIp(request),
                host: request.headers.host ?? '',
                origin: request.headers.origin ?? '',
                referer: request.headers.referer ?? '',
                userAgent: request.headers['user-agent'] ?? '',
                query: truncate(request.query, maxPayloadLength),
                params: truncate(request.params, maxPayloadLength),
                body: truncate(request.body, maxPayloadLength)
            }
            const message = JSON.stringify(payload)
            if (response.statusCode >= 500) logger.error(message)
            else if (response.statusCode >= 400) logger.warn(message)
            else logger.log(message)
        })
        next()
    }
}
