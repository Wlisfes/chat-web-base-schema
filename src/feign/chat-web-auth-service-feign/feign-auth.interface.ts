import type {
    AuthPermissionCacheInvalidateRequestDto,
    AuthPermissionCacheInvalidateResponseDto,
    AuthPermissionCheckRequestDto,
    AuthPermissionCheckResponseDto
} from './feign-auth.dto'

export type AuthPermissionCheckInput = AuthPermissionCheckRequestDto
export type AuthPermissionCheckResult = AuthPermissionCheckResponseDto
export type AuthPermissionCacheInvalidateInput = AuthPermissionCacheInvalidateRequestDto
export type AuthPermissionCacheInvalidateResult = AuthPermissionCacheInvalidateResponseDto

/** Auth 权限服务 Feign 实现约束。 */
export interface FeignClientAuthImplementation {
    checkPermission(authorization: string, input: AuthPermissionCheckInput): Promise<AuthPermissionCheckResult>
    invalidatePermissionCache(
        authorization: string,
        input: AuthPermissionCacheInvalidateInput
    ): Promise<AuthPermissionCacheInvalidateResult>
}
