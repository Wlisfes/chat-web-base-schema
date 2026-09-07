import { ConfigService } from '@nestjs/config'
import { FeignBody, FeignClient, FeignHeader, FeignPost } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import { AccountUserSummaryResponseDto, AccountUserBatchDto } from './feign-account.dto'
import type * as AccountTypes from './feign-account.interface'

/**
 * 账号服务业务 Feign 客户端。
 *
 * 只承载跨服务业务数据查询；认证与令牌内省由鉴权服务的内部协议负责，不在此声明，
 * 因此 Authorization 位固定传递 `feign.service_token` 服务间凭据。
 *
 * 客户端通过 Gateway 访问账号服务的 `/feign/account` 服务间入口；Gateway 地址和超时读取
 * Nacos `feign.url` 与 `feign.timeout`。
 */
@FeignClient({
    name: '账号服务',
    prefix: '/feign/account',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.url',
    timeoutConfigKey: 'feign.timeout'
})
export class FeignClientAccountManager extends FeignWebClient<AccountTypes.FeignClientAccountImplementation> {
    constructor(service?: AccountTypes.FeignClientAccountImplementation, configService?: ConfigService) {
        super(service, configService)
    }

    @FeignPost('/user/batch/resolver', {
        operation: { summary: '供内部服务批量把账号 UID 还原为展示摘要' },
        request: { source: 'body', type: AccountUserBatchDto },
        response: { type: AccountUserSummaryResponseDto, isArray: true, description: '账号展示摘要列表' }
    })
    async batchResolveUsers(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: AccountUserBatchDto
    ): Promise<AccountTypes.AccountUserSummary[]> {
        return this.dispatch('batchResolveUsers', _authorization, _input)
    }
}
