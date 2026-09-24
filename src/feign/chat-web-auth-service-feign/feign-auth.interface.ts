import type * as AuthDto from './feign-auth.dto'

/**查询授权身份与数据范围的请求入参。*/
export type AuthAuthorizedPrincipalInput = AuthDto.AuthAuthorizedPrincipalRequestDto
/**授权身份、权限校验结论与数据范围。*/
export type AuthAuthorizedPrincipalResult = AuthDto.AuthAuthorizedPrincipalResponseDto
/**清理权限缓存的请求入参。*/
export type AuthPermissionCacheInvalidateInput = AuthDto.AuthPermissionCacheInvalidateRequestDto
/**权限缓存清理结果。*/
export type AuthPermissionCacheInvalidateResult = AuthDto.AuthPermissionCacheInvalidateResponseDto

/** Auth 权限服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientAuthImplementation {
    /**校验权限码并返回授权身份、角色与数据范围**/
    httpBaseAuthAuthorizedPrincipalResolver(
        authorization: string,
        input: AuthAuthorizedPrincipalInput
    ): Promise<AuthAuthorizedPrincipalResult>
    /**按账号 UID 清理权限缓存**/
    httpBaseAuthInvalidatePermissionCache(
        authorization: string,
        input: AuthPermissionCacheInvalidateInput
    ): Promise<AuthPermissionCacheInvalidateResult>
}
