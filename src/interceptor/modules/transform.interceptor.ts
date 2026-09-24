import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { createApiResponse, isApiResponse } from '@/utils/modules/response'
import { resolveRequestId } from '@/utils/modules/request-context'
import { setBusinessCodeHeader } from '@/runtime/logging/business-status'

interface HttpRequestLike {
    headers: Record<string, string | string[] | undefined>
    logId?: string
    executionMethod?: string
    routeMethod?: string
}

interface HttpResponseLike {
    headersSent?: boolean
    getHeader(name: string): string | number | string[] | undefined
    setHeader(name: string, value: string): unknown
}

/** 拦截器早于管道执行；提前记录 Controller.method，参数校验失败时异常过滤器仍能定位接口。 */
function resolveRouteMethod(context: ExecutionContext): string | undefined {
    const controller = context.getClass?.()
    const handler = context.getHandler?.()
    return controller?.name && handler?.name ? `${controller.name}.${handler.name}` : undefined
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

        request.logId = logId
        request.routeMethod = resolveRouteMethod(context)
        request.headers['x-request-id'] = logId
        if (!response.headersSent) response.setHeader('x-request-id', logId)

        if (response.headersSent || response.getHeader('Content-Type') !== undefined) {
            return next.handle()
        }
        return next.handle().pipe(
            map(data => {
                const body = !isApiResponse(data) ? createApiResponse(data, { logId }) : data.logId === logId ? data : { ...data, logId }
                setBusinessCodeHeader(response, body.code)
                return body
            })
        )
    }
}
