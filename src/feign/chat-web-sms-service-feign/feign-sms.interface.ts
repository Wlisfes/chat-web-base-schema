import type * as SmsDto from './feign-sms.dto'

/**客户短信应用数量。*/
export type SmsAppCount = SmsDto.SmsAppCountResponseDto
/**按客户统计短信应用数量的请求入参。*/
export type SmsAppCountResolverInput = SmsDto.SmsAppCountResolverRequestDto
/**短信应用摘要。*/
export type SmsAppSummary = SmsDto.SmsAppSummaryResponseDto
/**按主键批量查询短信应用摘要的请求入参。*/
export type SmsColumnAppResolverInput = SmsDto.SmsColumnAppResolverRequestDto
/**扫描并推送进入发送窗口的短信任务。*/
export type SmsTaskEnqueueResult = SmsDto.SmsTaskEnqueueResponseDto
/**扫描并推送短信任务的请求入参。*/
export type SmsTaskEnqueueInput = SmsDto.SmsTaskEnqueueRequestDto

/** SMS 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientSmsImplementation {
    /**按客户主键统计短信应用数量**/
    httpBaseSmsAppCountResolver(authorization: string, input: SmsAppCountResolverInput): Promise<SmsAppCount>
    /**按短信应用主键批量获取短信应用摘要**/
    httpBaseSmsColumnAppResolver(authorization: string, input: SmsColumnAppResolverInput): Promise<SmsAppSummary[]>
    /**扫描进入发送窗口的待发送任务并推入短信任务队列**/
    httpBaseSmsTaskEnqueue(authorization: string, input: SmsTaskEnqueueInput): Promise<SmsTaskEnqueueResult>
}
