import type * as CrmDto from './feign-crm.dto'

/**客户详情数据。*/
export type CrmConsumer = CrmDto.CrmConsumerResponseDto
/**客户下拉选项数据。*/
export type CrmConsumerSelect = CrmDto.CrmConsumerSelectResponseDto
/**客户分页数据。*/
export type CrmConsumerPage = CrmDto.CrmConsumerPageResponseDto
/**创建客户的请求入参。*/
export type CrmCreateConsumerInput = CrmDto.CrmCreateConsumerRequestDto
/**更新客户的请求入参。*/
export type CrmUpdateConsumerInput = CrmDto.CrmUpdateConsumerRequestDto
/**更新客户状态的请求入参。*/
export type CrmUpdateConsumerStatusInput = CrmDto.CrmUpdateConsumerStatusRequestDto
/**按主键查询客户详情的请求入参。*/
export type CrmResolveConsumerInput = CrmDto.CrmResolveConsumerRequestDto
/**筛选客户下拉数据的请求入参。*/
export type CrmSelectConsumerInput = CrmDto.CrmSelectConsumerRequestDto
/**分页查询客户的请求入参。*/
export type CrmListConsumerInput = CrmDto.CrmListConsumerRequestDto

/** CRM 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientCrmImplementation {
    /**按客户主键获取客户详情**/
    httpBaseCrmConsumerResolver(authorization: string, input: CrmResolveConsumerInput): Promise<CrmConsumer>
    /**按名称筛选客户下拉数据**/
    httpBaseCrmSelectConsumer(authorization: string, input: CrmSelectConsumerInput): Promise<CrmConsumerSelect[]>
    /**创建客户**/
    httpBaseCrmCreateConsumer(authorization: string, input: CrmCreateConsumerInput): Promise<CrmConsumer>
    /**更新客户基础信息**/
    httpBaseCrmUpdateConsumer(authorization: string, input: CrmUpdateConsumerInput): Promise<CrmConsumer>
    /**更新客户启用状态**/
    httpBaseCrmUpdateConsumerStatus(authorization: string, input: CrmUpdateConsumerStatusInput): Promise<CrmConsumer>
    /**分页查询客户列表**/
    httpBaseCrmColumnConsumer(authorization: string, input: CrmListConsumerInput): Promise<CrmConsumerPage>
}
