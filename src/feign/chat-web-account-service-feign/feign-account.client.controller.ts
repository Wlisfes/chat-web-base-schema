import { ConfigService } from '@nestjs/config'
import { FeignBody, FeignClient, FeignHeader, FeignPost } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import * as AccountDto from './feign-account.dto'
import type * as AccountTypes from './feign-account.interface'

/**
 * 账号服务业务 Feign 客户端。
 *
 * 只承载跨服务业务数据查询；认证与令牌内省由鉴权服务的内部协议负责，不在此声明，
 * 因此 Authorization 位固定传递 `gateway.feign.service_token` 服务间凭据。
 *
 * 客户端通过 Gateway 访问账号服务的 `/feign/account` 服务间入口；Gateway 地址和超时读取
 * Nacos `gateway.feign.url` 与 `gateway.feign.timeout`。
 */
@FeignClient({
    name: '账号服务',
    prefix: '/feign/account',
    serviceTokenKey: 'gateway.feign.service_token',
    baseUrlConfigKey: 'gateway.feign.url',
    timeoutConfigKey: 'gateway.feign.timeout'
})
export class FeignClientAccountManager extends FeignWebClient<AccountTypes.FeignClientAccountImplementation> {
    constructor(service?: AccountTypes.FeignClientAccountImplementation, configService?: ConfigService) {
        super(service, configService)
    }

    /**按列表批量把账号 UID 还原为展示摘要**/
    @FeignPost('/user/column/resolve', {
        operation: { summary: '供内部服务按列表批量把账号 UID 还原为展示摘要' },
        request: { source: 'body', type: AccountDto.AccountColumnUserResolverDto },
        response: { type: AccountDto.AccountUserSummaryResponseDto, isArray: true, description: '账号展示摘要列表' }
    })
    async httpBaseAccountColumnUserResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: AccountDto.AccountColumnUserResolverDto
    ): Promise<AccountTypes.AccountUserSummary[]> {
        return this.dispatch('httpBaseAccountColumnUserResolver', _authorization, _input)
    }

    /**按账号 UID 还原单个展示摘要**/
    @FeignPost('/user/resolve', {
        operation: { summary: '供内部服务按账号 UID 还原单个展示摘要' },
        request: { source: 'body', type: AccountDto.AccountUserResolverDto },
        response: { type: AccountDto.AccountUserSummaryResponseDto, description: '账号展示摘要' }
    })
    async httpBaseAccountUserResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: AccountDto.AccountUserResolverDto
    ): Promise<AccountTypes.AccountUserSummary> {
        return this.dispatch('httpBaseAccountUserResolver', _authorization, _input)
    }
}
