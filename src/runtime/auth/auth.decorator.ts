import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'
import { AuthenticatedRequest, AuthPrincipal } from './auth.interface'

export const IS_PUBLIC_ROUTE = 'auth:is-public'
export const REQUIRED_PERMISSIONS = 'auth:required-permissions'

export const Public = () => SetMetadata(IS_PUBLIC_ROUTE, true)
/** 声明接口所需权限码。多个权限码为或关系；传入 * 时跳过权限校验但仍查询角色与数据权限。未使用该装饰器时不请求 Auth。 */
export const RequirePermissions = (...permissionCodes: string[]) => SetMetadata(REQUIRED_PERMISSIONS, permissionCodes)

export const CurrentPrincipal = createParamDecorator((_data: unknown, context: ExecutionContext): AuthPrincipal => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().user
})
