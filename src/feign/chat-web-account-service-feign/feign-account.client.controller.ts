import { ConfigService } from '@nestjs/config'
import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import { AccountConsumerResponseDto, AccountUserSummaryResponseDto, AccountUserBatchDto } from './feign-account.dto'
import type * as AccountTypes from './feign-account.interface'

/**
 * 账号服务业务 Feign 客户端。
 *
 * 只承载跨服务业务数据查询；认证与令牌内省由鉴权服务的内部协议负责，不在此声明，
 * 因此 Authorization 位固定传递 `feign.service_token` 服务间凭据。
 *
 * 服务间调用统一经网关按 `/feign/<服务名>` 前缀转发，网关不改写该前缀，客户端请求
 * 路径与服务端继承路由完全一致。
 */
@FeignClient({
    name: '账号服务',
    prefix: '/feign/account',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.gateway.url',
    timeoutConfigKey: 'feign.gateway.timeout'
})
export class FeignClientAccountManager extends FeignWebClient<AccountTypes.FeignClientAccountImplementation> {
    constructor(service?: AccountTypes.FeignClientAccountImplementation, configService?: ConfigService) {
        super(service, configService)
    }

    @FeignGet('/consumer/resolver', {
        operation: { summary: '供内部服务按客户主键获取客户详情' },
        response: { type: AccountConsumerResponseDto, description: '客户详情' }
    })
    async resolveConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('keyId') _keyId: number
    ): Promise<AccountTypes.AccountConsumer> {
        return this.dispatch('resolveConsumer', _authorization, _keyId)
    }

    @FeignGet('/consumer/select', {
        operation: { summary: '供内部服务筛选客户下拉数据' },
        response: { type: AccountConsumerResponseDto, isArray: true, description: '客户下拉列表' }
    })
    async selectConsumers(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('name') _name?: string
    ): Promise<AccountTypes.AccountConsumer[]> {
        return this.dispatch('selectConsumers', _authorization, _name)
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
