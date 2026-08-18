import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { createApiResponse, isApiResponse } from '@/utils/modules/response'

interface HttpResponseLike {
    headersSent?: boolean
    getHeader(name: string): string | number | string[] | undefined
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        /**微服务RPC上下文：直接透传原始数据，由HTTP网关层统一包装**/
        if (context.getType() !== 'http') {
            return next.handle()
        }
        const response = context.switchToHttp().getResponse<HttpResponseLike>()
        if (response.headersSent || response.getHeader('Content-Type') !== undefined) {
            return next.handle()
        }
        return next.handle().pipe(map(data => (isApiResponse(data) ? data : createApiResponse(data))))
    }
}
