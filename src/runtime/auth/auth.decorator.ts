import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'
import { AuthenticatedRequest, AuthPrincipal } from './auth.interface'

export const IS_PUBLIC_ROUTE = 'auth:is-public'
export const REQUIRED_PERMISSIONS = 'auth:required-permissions'
export const LOGGER_ENABLED = 'auth:logger'

/** 权限码之外的接口选项。未传 logger 时不记录日志。 */
export interface RequirePermissionsOptions {
    /** 是否记录日志。权限码仍用于按页面功能查询。 */
    logger?: boolean
}

export const Public = () => SetMetadata(IS_PUBLIC_ROUTE, true)
/**
 * 声明接口所需权限码。多个权限码为或关系；传入 * 时跳过权限校验但仍查询角色与数据权限。
 * 未使用该装饰器时不请求 Auth。只有 logger 为 true 的接口才记录日志。
 */
export const RequirePermissions = (permissionCodes: string | string[] | readonly string[], options?: RequirePermissionsOptions) => {
    const codes = (Array.isArray(permissionCodes) ? permissionCodes : [permissionCodes]).filter(code => code.trim())
    return applyDecorators(SetMetadata(REQUIRED_PERMISSIONS, codes), SetMetadata(LOGGER_ENABLED, options?.logger === true))
}

export const CurrentPrincipal = createParamDecorator((_data: unknown, context: ExecutionContext): AuthPrincipal => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().user
})
