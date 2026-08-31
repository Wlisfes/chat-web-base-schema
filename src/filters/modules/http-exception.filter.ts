import { ArgumentsHost, Catch, ExceptionFilter, ExecutionContext, HttpStatus, Logger } from '@nestjs/common'
import type { ApiResponse } from '@/types'
import { createApiResponse } from '@/utils/modules/response'
import { resolveRequestId } from '@/utils/modules/request-context'
import {
    resolveExceptionData,
    resolveExceptionExecutionMethod,
    resolveExceptionMessage,
    resolveExceptionStatus
} from '@/filters/modules/exception-response'
import { PRESERVE_HTTP_STATUS_METADATA, PRESERVE_HTTP_STATUS_REQUEST } from '@/filters/modules/preserve-http-status.decorator'
import { getActiveTraceContext } from '@/runtime/observability'

interface HttpRequestLike {
    [PRESERVE_HTTP_STATUS_REQUEST]?: boolean
    method?: string
    originalUrl?: string
    url?: string
    headers?: Record<string, string | string[] | undefined>
    logId?: string
    executionMethod?: string
}

interface HttpResponseLike {
    headersSent?: boolean
    status(code: number): HttpResponseLike
    setHeader(name: string, value: string): unknown
    json(body: ApiResponse): unknown
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger()

    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp()
        const request = context.getRequest<HttpRequestLike>()
        const response = context.getResponse<HttpResponseLike>()
        const status = resolveExceptionStatus(exception)
        const message = resolveExceptionMessage(exception, status)
        const logId = resolveRequestId(request.logId ?? request.headers?.['x-request-id'])
        const body = createApiResponse(resolveExceptionData(exception), { code: status, message, logId })
        const method = request.method ?? 'UNKNOWN'
        const url = request.originalUrl ?? request.url ?? '/'
        const executionMethod = resolveExceptionExecutionMethod(
            exception,
            request.executionMethod ?? this.resolveRouteExecutionMethod(host)
        )
        const traceId = getActiveTraceContext().traceId
        const logMessage = `${method} ${url} -> ${status} ${message} [${logId}]${traceId ? ` [traceId=${traceId}]` : ''}`

        request.logId = logId
        request.executionMethod = executionMethod
        if (request.headers) request.headers['x-request-id'] = logId
        if (!response.headersSent) response.setHeader('x-request-id', logId)

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined, executionMethod)
        } else {
            this.logger.warn(logMessage, executionMethod)
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

    private resolveRouteExecutionMethod(host: ArgumentsHost): string | undefined {
        const context = host as ExecutionContext
        const controllerName = context.getClass?.()?.name
        const handlerName = context.getHandler?.()?.name
        const executionMethod = [controllerName, handlerName].filter(Boolean).join('.')
        return executionMethod || undefined
    }
}
