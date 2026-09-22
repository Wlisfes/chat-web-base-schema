import type {
    AuthPermissionCacheInvalidateRequestDto,
    AuthPermissionCacheInvalidateResponseDto,
    AuthAuthorizedPrincipalRequestDto,
    AuthAuthorizedPrincipalResponseDto
} from './feign-auth.dto'

export type AuthAuthorizedPrincipalInput = AuthAuthorizedPrincipalRequestDto
export type AuthAuthorizedPrincipalResult = AuthAuthorizedPrincipalResponseDto
export type AuthPermissionCacheInvalidateInput = AuthPermissionCacheInvalidateRequestDto
export type AuthPermissionCacheInvalidateResult = AuthPermissionCacheInvalidateResponseDto

/** Auth 权限服务 Feign 实现约束。 */
export interface FeignClientAuthImplementation {
    resolveAuthorizedPrincipal(authorization: string, input: AuthAuthorizedPrincipalInput): Promise<AuthAuthorizedPrincipalResult>
    invalidatePermissionCache(
        authorization: string,
        input: AuthPermissionCacheInvalidateInput
    ): Promise<AuthPermissionCacheInvalidateResult>
}
