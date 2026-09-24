import { ArgumentsHost, Catch, ExceptionFilter, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { ApiResponse } from '@/types'
import { createApiResponse } from '@/utils/modules/response'
import { getActiveExecutionMethod, resolveRequestId } from '@/utils/modules/request-context'
import { setBusinessCodeHeader } from '@/runtime/logging/business-status'
import { normalizeServiceExecutionMethod } from '@/runtime/logging/execution-method'
import { resolvePublicRequestUrl } from '@/utils/modules/request-url'
import {
    resolveExceptionData,
    resolveExceptionExecutionMethod,
    resolveExceptionMessage,
    resolveExceptionStatus
} from '@/filters/modules/exception-response'
import { PRESERVE_HTTP_STATUS_METADATA, PRESERVE_HTTP_STATUS_REQUEST } from '@/filters/modules/preserve-http-status.decorator'
import { getActiveTraceContext } from '@/runtime/observability'
import { sanitizeRequestLogValue } from '@/runtime/logging/request-logging.middleware'
import { serializeExceptionForLog } from '@/filters/modules/exception-log'

interface HttpRequestLike {
    [PRESERVE_HTTP_STATUS_REQUEST]?: boolean
    method?: string
    originalUrl?: string
    url?: string
    headers?: Record<string, string | string[] | undefined>
    logId?: string
    executionMethod?: string
    routeMethod?: string
    query?: unknown
    params?: unknown
    body?: unknown
    user?: { uid?: unknown; number?: unknown; name?: unknown }
}

interface HttpResponseLike {
    headersSent?: boolean
    status(code: number): HttpResponseLike
    setHeader(name: string, value: string): unknown
    json(body: ApiResponse): unknown
}

function hasContent(value: unknown): boolean {
    if (value === undefined || value === null || value === '') return false
    return typeof value !== 'object' || Object.keys(value).length > 0
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
        const url = resolvePublicRequestUrl(request)
        const routeMethod = this.resolveRouteMethod(host, request)
        const executionMethod = resolveExceptionExecutionMethod(
            exception,
            normalizeServiceExecutionMethod(getActiveExecutionMethod() ?? request.executionMethod) ?? routeMethod
        )
        const traceId = getActiveTraceContext().traceId
        const location = executionMethod ? ` 执行方法:[${executionMethod}]` : ''
        const details = this.createLogDetails(request, exception)
        const logMessage = `${method} ${url} -> ${status} ${message}${location}${traceId ? ` [traceId=${traceId}]` : ''}${
            details ? ` ${details}` : ''
        }`

        request.logId = logId
        if (executionMethod) request.executionMethod = executionMethod
        if (request.headers) request.headers['x-request-id'] = logId
        if (!response.headersSent) {
            response.setHeader('x-request-id', logId)
            setBusinessCodeHeader(response, status)
        }

        if (status !== HttpStatus.OK) {
            const stack = status >= HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error ? exception.stack : undefined
            // Nest 会把多余的 undefined 参数当作消息打印成单独一行 undefined，因此只传入实际存在的 stack/context。
            if (stack) this.logger.error(logMessage, stack, ...(executionMethod ? [executionMethod] : []))
            else if (executionMethod) this.logger.error(logMessage, undefined, executionMethod)
            else this.logger.error(logMessage)
        } else if (executionMethod) {
            this.logger.log(logMessage, executionMethod)
        } else {
            this.logger.log(logMessage)
        }

        if (!response.headersSent) {
            /** 前端统一读取响应体 code，避免 Axios 将业务异常当作传输层错误。 */
            response.status(this.shouldPreserveHttpStatus(host, request) ? status : HttpStatus.OK).json(body)
        }
    }

    /**
     * 异步驱动错误的堆栈可能只剩 node_modules 帧，此时用当前命中的路由处理器作为定位兜底。
     * Nest 传给异常过滤器的 ArgumentsHost 不携带 handler，因此优先读取拦截器提前写入请求的路由方法。
     */
    private resolveRouteMethod(host: ArgumentsHost, request: HttpRequestLike): string {
        if (request.routeMethod) return request.routeMethod
        const context = host as ExecutionContext
        const handler = context.getHandler?.()
        const controller = context.getClass?.()
        if (typeof handler !== 'function' || typeof controller !== 'function' || !controller.name || !handler.name) return ''
        return `${controller.name}.${handler.name}`
    }

    /** 拼出脱敏后的入参、当前用户和原始异常对象，业务服务日志无需再回网关查找请求内容。 */
    private createLogDetails(request: HttpRequestLike, exception: unknown): string {
        const details: Record<string, unknown> = {}
        if (hasContent(request.query)) details.query = sanitizeRequestLogValue(request.query)
        if (hasContent(request.params)) details.params = sanitizeRequestLogValue(request.params)
        if (hasContent(request.body)) details.body = sanitizeRequestLogValue(request.body)
        const user = request.user
        if (user && (user.uid !== undefined || user.number !== undefined || user.name !== undefined)) {
            details.user = { uid: user.uid, number: user.number, name: user.name }
        }
        // 输出原始异常对象（含 cause、驱动错误码等自有属性），堆栈仍由 Logger 单独输出。
        details.error = serializeExceptionForLog(exception)
        return Object.keys(details).length ? JSON.stringify(details) : ''
    }

    private shouldPreserveHttpStatus(host: ArgumentsHost, request: HttpRequestLike): boolean {
        if (request[PRESERVE_HTTP_STATUS_REQUEST] === true) return true
        const context = host as ExecutionContext
        const targets = [context.getHandler?.(), context.getClass?.()].filter((target): target is Function => typeof target === 'function')
        return targets.some(target => Reflect.getMetadata(PRESERVE_HTTP_STATUS_METADATA, target) === true)
    }
}
