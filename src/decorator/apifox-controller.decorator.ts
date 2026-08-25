import { Controller, type ControllerOptions, applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

export interface ApifoxControllerOptions {
    /** 是否为控制器内全部接口声明 Bearer Token 鉴权。 */
    bearerAuth?: boolean
}

/** 聚合 NestJS Controller 与 Swagger/Apifox 分组装饰器。 */
export function ApifoxController(
    name: string,
    pathOrOptions?: string | string[] | ControllerOptions,
    options: ApifoxControllerOptions = {}
): ClassDecorator {
    const controllerDecorator =
        typeof pathOrOptions === 'object' && !Array.isArray(pathOrOptions) ? Controller(pathOrOptions) : Controller(pathOrOptions ?? '')
    const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [ApiTags(name), controllerDecorator]
    if (options.bearerAuth) {
        decorators.push(ApiBearerAuth('authorization'))
    }
    return applyDecorators(...decorators)
}
