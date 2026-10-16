import type * as SmsDto from './feign-sms.dto'

/**客户短信应用数量。*/
export type SmsAppCount = SmsDto.SmsAppCountResponseDto
/**按客户统计短信应用数量的请求入参。*/
export type SmsAppCountResolverInput = SmsDto.SmsAppCountResolverRequestDto

/** SMS 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientSmsImplementation {
    /**按客户主键统计短信应用数量**/
    httpBaseSmsAppCountResolver(authorization: string, input: SmsAppCountResolverInput): Promise<SmsAppCount>
}
