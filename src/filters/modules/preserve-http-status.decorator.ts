import { applyDecorators, CallHandler, ExecutionContext, Injectable, NestInterceptor, SetMetadata, UseInterceptors } from '@nestjs/common'
import { Observable } from 'rxjs'

export const PRESERVE_HTTP_STATUS_METADATA = 'chat-web:preserve-http-status'
export const PRESERVE_HTTP_STATUS_REQUEST = Symbol.for('chat-web:preserve-http-status-request')

@Injectable()
export class PreserveHttpStatusInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Record<PropertyKey, unknown>>()
        request[PRESERVE_HTTP_STATUS_REQUEST] = true
        return next.handle()
    }
}

/** 仅用于健康检查、Webhook 等依赖原生 HTTP 状态的协议型接口。 */
export const PreserveHttpStatus = () =>
    applyDecorators(SetMetadata(PRESERVE_HTTP_STATUS_METADATA, true), UseInterceptors(PreserveHttpStatusInterceptor))
