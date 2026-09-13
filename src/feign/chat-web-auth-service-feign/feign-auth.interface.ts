import type {
    AuthPermissionCacheInvalidateRequestDto,
    AuthPermissionCacheInvalidateResponseDto,
    AuthPermissionCheckRequestDto,
    AuthPermissionCheckResponseDto
    , AuthDataScopeRequestDto, AuthDataScopeResponseDto, AuthSuperAdminResponseDto
} from './feign-auth.dto'

export type AuthPermissionCheckInput = AuthPermissionCheckRequestDto
export type AuthPermissionCheckResult = AuthPermissionCheckResponseDto
export type AuthPermissionCacheInvalidateInput = AuthPermissionCacheInvalidateRequestDto
export type AuthPermissionCacheInvalidateResult = AuthPermissionCacheInvalidateResponseDto
export type AuthDataScopeInput = AuthDataScopeRequestDto
export type AuthDataScopeResult = AuthDataScopeResponseDto
export type AuthSuperAdminResult = AuthSuperAdminResponseDto

/** Auth 权限服务 Feign 实现约束。 */
export interface FeignClientAuthImplementation {
    checkPermission(authorization: string, input: AuthPermissionCheckInput): Promise<AuthPermissionCheckResult>
    invalidatePermissionCache(
        authorization: string,
        input: AuthPermissionCacheInvalidateInput
    ): Promise<AuthPermissionCacheInvalidateResult>
    resolveDataScope(authorization: string, input: AuthDataScopeInput): Promise<AuthDataScopeResult>
    checkSuperAdmin(authorization: string, input: { uid: string }): Promise<AuthSuperAdminResult>
}
