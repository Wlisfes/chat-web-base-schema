import { ArgumentsHost, Catch, ExceptionFilter, ExecutionContext, HttpStatus, Logger } from '@nestjs/common'
import type { ApiResponse } from '@/types'
import { createApiResponse } from '@/utils/modules/response'
import { resolveExceptionData, resolveExceptionMessage, resolveExceptionStatus } from '@/filters/modules/exception-response'
import { PRESERVE_HTTP_STATUS_METADATA, PRESERVE_HTTP_STATUS_REQUEST } from '@/filters/modules/preserve-http-status.decorator'
import { getActiveTraceContext } from '@/runtime/observability'

interface HttpRequestLike {
    [PRESERVE_HTTP_STATUS_REQUEST]?: boolean
    method?: string
    originalUrl?: string
    url?: string
    headers?: Record<string, string | string[] | undefined>
    logId?: string
}

interface HttpResponseLike {
    headersSent?: boolean
    status(code: number): HttpResponseLike
    json(body: ApiResponse): unknown
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name)

    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp()
        const request = context.getRequest<HttpRequestLike>()
        const response = context.getResponse<HttpResponseLike>()
        const status = resolveExceptionStatus(exception)
        const message = resolveExceptionMessage(exception, status)
        const body = createApiResponse(resolveExceptionData(exception), { code: status, message })
        const method = request.method ?? 'UNKNOWN'
        const url = request.originalUrl ?? request.url ?? '/'
        const requestId = request.logId ?? request.headers?.['x-request-id']
        const traceId = getActiveTraceContext().traceId
        const logMessage = `${method} ${url} -> ${status} ${message}${requestId ? ` [${String(requestId)}]` : ''}${traceId ? ` [traceId=${traceId}]` : ''}`

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined)
        } else {
            this.logger.warn(logMessage)
        }

        if (!response.headersSent) {
            /** 前端统一读取响应体 code，避免 Axios 将业务异常当作传输层错误。 */
            response.status(this.shouldPreserveHttpStatus(host, request) ? status : HttpStatus.OK).json(body)
        }
    }

    private shouldPreserveHttpStatus(host: ArgumentsHost, request: HttpRequestLike): boolean {
        if (request[PRESERVE_HTTP_STATUS_REQUEST] === true) return true
        const context = host as ExecutionContext
        const targets = [context.getHandler?.(), context.getClass?.()].filter((target): target is Function => typeof target === 'function')
        return targets.some(target => Reflect.getMetadata(PRESERVE_HTTP_STATUS_METADATA, target) === true)
    }
}
