import { FeignBody, FeignClient, FeignHeader, FeignPost } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import * as SmsDto from './feign-sms.dto'
import type * as SmsTypes from './feign-sms.interface'
import { ConfigService } from '@nestjs/config'

/**
 * SMS 服务业务 Feign 客户端。
 *
 * 请求通过 Gateway 访问 SMS 服务的 `/feign/sms` 服务间入口；Gateway 地址和超时读取
 * Nacos `gateway.feign.url` 与 `gateway.feign.timeout`，服务端在分发实现方法前校验 `gateway.feign.service_token`。
 */
@FeignClient({
    name: 'SMS服务',
    prefix: '/feign/sms',
    serviceTokenKey: 'gateway.feign.service_token',
    baseUrlConfigKey: 'gateway.feign.url',
    timeoutConfigKey: 'gateway.feign.timeout'
})
export class FeignClientSmsManager extends FeignWebClient<SmsTypes.FeignClientSmsImplementation> {
    constructor(service?: SmsTypes.FeignClientSmsImplementation, configService?: ConfigService) {
        super(service, configService)
    }

    /**按客户主键统计短信应用数量**/
    @FeignPost('/app/count/resolve', {
        operation: { summary: '供内部服务按客户主键统计短信应用数量' },
        request: { source: 'body', type: SmsDto.SmsAppCountResolverRequestDto },
        response: { type: SmsDto.SmsAppCountResponseDto, description: '客户短信应用数量' }
    })
    async httpBaseSmsAppCountResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: SmsTypes.SmsAppCountResolverInput
    ): Promise<SmsTypes.SmsAppCount> {
        return this.dispatch('httpBaseSmsAppCountResolver', _authorization, _input)
    }
}
