import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { createApiResponse } from '@/utils/modules/response'
import { resolveExceptionData, resolveExceptionMessage, resolveExceptionStatus } from '@/filters/modules/exception-response'
import { getActiveTraceContext } from '@/runtime/observability'

interface RpcRequestLike {
    logId?: string
    request?: RpcRequestLike
}

/** 微服务异常过滤器：统一异常结构后交给 RPC 调用方处理。 */
@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(RpcExceptionFilter.name)

    catch(exception: unknown, host: ArgumentsHost): Observable<never> {
        const context = host.switchToRpc()
        const data = context.getData<RpcRequestLike>()
        const status = resolveExceptionStatus(exception)
        const message = resolveExceptionMessage(exception, status)
        const body = createApiResponse(resolveExceptionData(exception), { code: status, message })
        const requestId = data?.request?.logId ?? data?.logId
        const traceId = getActiveTraceContext().traceId
        const logMessage = `${status} ${message}${requestId ? ` [${requestId}]` : ''}${traceId ? ` [traceId=${traceId}]` : ''}`

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined)
        } else {
            this.logger.warn(logMessage)
        }

        return throwError(() => ({ ...body, status }))
    }
}
