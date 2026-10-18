import type * as SrmDto from './feign-srm.dto'

/**供应商详情数据。*/
export type SrmUser = SrmDto.SrmUserResponseDto
/**供应商分页数据。*/
export type SrmUserPage = SrmDto.SrmUserPageResponseDto
/**按主键查询供应商详情的请求入参。*/
export type SrmResolveUserInput = SrmDto.SrmResolveUserRequestDto
/**按主键批量查询供应商详情的请求入参。*/
export type SrmColumnUserResolverInput = SrmDto.SrmColumnUserResolverRequestDto
/**分页查询供应商的请求入参。*/
export type SrmListUserInput = SrmDto.SrmListUserRequestDto

/** SRM 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientSrmImplementation {
    /**按供应商主键获取供应商详情**/
    httpBaseSrmUserResolver(authorization: string, input: SrmResolveUserInput): Promise<SrmUser>
    /**按供应商主键批量获取供应商详情**/
    httpBaseSrmColumnUserResolver(authorization: string, input: SrmColumnUserResolverInput): Promise<SrmUser[]>
    /**分页查询供应商列表**/
    httpBaseSrmColumnUser(authorization: string, input: SrmListUserInput): Promise<SrmUserPage>
}
