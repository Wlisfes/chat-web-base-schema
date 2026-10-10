import type * as CrmDto from './feign-crm.dto'

/**客户详情数据。*/
export type CrmUser = CrmDto.CrmUserResponseDto
/**客户分页数据。*/
export type CrmUserPage = CrmDto.CrmUserPageResponseDto
/**按主键查询客户详情的请求入参。*/
export type CrmResolveUserInput = CrmDto.CrmResolveUserRequestDto
/**按主键批量查询客户详情的请求入参。*/
export type CrmColumnUserResolverInput = CrmDto.CrmColumnUserResolverRequestDto
/**分页查询客户的请求入参。*/
export type CrmListUserInput = CrmDto.CrmListUserRequestDto

/** CRM 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientCrmImplementation {
    /**按客户主键获取客户详情**/
    httpBaseCrmUserResolver(authorization: string, input: CrmResolveUserInput): Promise<CrmUser>
    /**按客户主键批量获取客户详情**/
    httpBaseCrmColumnUserResolver(authorization: string, input: CrmColumnUserResolverInput): Promise<CrmUser[]>
    /**分页查询客户列表**/
    httpBaseCrmColumnUser(authorization: string, input: CrmListUserInput): Promise<CrmUserPage>
}
