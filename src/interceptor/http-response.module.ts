import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { HttpExceptionFilter } from '@/filters/modules/http-exception.filter'
import { TransformInterceptor } from '@/interceptor/modules/transform.interceptor'

/** 为 HTTP 服务一次性注册统一成功响应和异常响应处理。 */
@Module({
    providers: [
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter }
    ]
})
export class HttpResponseModule {}
