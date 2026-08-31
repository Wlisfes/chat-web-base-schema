import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { createApiResponse, isApiResponse } from '@/utils/modules/response'
import { resolveRequestId } from '@/utils/modules/request-context'

interface HttpRequestLike {
    headers: Record<string, string | string[] | undefined>
    logId?: string
    executionMethod?: string
}

interface HttpResponseLike {
    headersSent?: boolean
    getHeader(name: string): string | number | string[] | undefined
    setHeader(name: string, value: string): unknown
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        /**微服务RPC上下文：直接透传原始数据，由HTTP网关层统一包装**/
        if (context.getType() !== 'http') {
            return next.handle()
        }
        const httpContext = context.switchToHttp()
        const request = httpContext.getRequest<HttpRequestLike>()
        const response = httpContext.getResponse<HttpResponseLike>()
        const logId = resolveRequestId(request.logId ?? request.headers['x-request-id'])
        const controllerName = context.getClass().name
        const handlerName = context.getHandler().name

        request.logId = logId
        request.headers['x-request-id'] = logId
        request.executionMethod = [controllerName, handlerName].filter(Boolean).join('.')
        if (!response.headersSent) response.setHeader('x-request-id', logId)

        if (response.headersSent || response.getHeader('Content-Type') !== undefined) {
            return next.handle()
        }
        return next.handle().pipe(
            map(data => {
                if (!isApiResponse(data)) return createApiResponse(data, { logId })
                return data.logId === logId ? data : { ...data, logId }
            })
        )
    }
}
