import type * as SmsDto from './feign-sms.dto'

/**客户短信应用数量。*/
export type SmsAppCount = SmsDto.SmsAppCountResponseDto
/**按客户统计短信应用数量的请求入参。*/
export type SmsAppCountResolverInput = SmsDto.SmsAppCountResolverRequestDto
/**短信应用摘要。*/
export type SmsAppSummary = SmsDto.SmsAppSummaryResponseDto
/**按主键批量查询短信应用摘要的请求入参。*/
export type SmsColumnAppResolverInput = SmsDto.SmsColumnAppResolverRequestDto

/** SMS 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientSmsImplementation {
    /**按客户主键统计短信应用数量**/
    httpBaseSmsAppCountResolver(authorization: string, input: SmsAppCountResolverInput): Promise<SmsAppCount>
    /**按短信应用主键批量获取短信应用摘要**/
    httpBaseSmsColumnAppResolver(authorization: string, input: SmsColumnAppResolverInput): Promise<SmsAppSummary[]>
}
