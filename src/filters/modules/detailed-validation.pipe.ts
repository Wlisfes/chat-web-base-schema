import { ValidationPipe, type ValidationError } from '@nestjs/common'

/**
 * 校验失败时把 class-validator 的原始 ValidationError 列表挂到异常 cause 上。
 * 响应内容与 Nest 默认 ValidationPipe 保持一致，异常过滤器据此在日志中输出字段、值和触发的约束。
 */
export class DetailedValidationPipe extends ValidationPipe {
    override createExceptionFactory(): (validationErrors?: ValidationError[]) => unknown {
        const factory = super.createExceptionFactory()
        return (validationErrors: ValidationError[] = []) => {
            const exception = factory(validationErrors)
            if (exception instanceof Error && exception.cause === undefined) {
                Object.defineProperty(exception, 'cause', { value: validationErrors, configurable: true, writable: true })
            }
            return exception
        }
    }
}
