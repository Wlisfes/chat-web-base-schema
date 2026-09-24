import { ConfigService } from '@nestjs/config'
import { FeignBody, FeignClient, FeignHeader, FeignPost } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as FinanceTypes from './feign-finance.interface'

/**
 * 财务服务业务 Feign 客户端。
 *
 * 价格与汇率属于跨服务基础参考数据，不做用户级数据隔离，因此统一使用服务间凭据调用；
 * 面向管理端的同名业务路由仍由 FinanceAuthGuard 校验终端用户令牌，两者互不影响。
 * 客户端通过 Gateway 访问财务服务的 `/feign/finance` 服务间入口；Gateway 地址和超时读取
 * Nacos `gateway.feign.url` 与 `gateway.feign.timeout`。
 */
@FeignClient({
    name: '财务服务',
    prefix: '/feign/finance',
    serviceTokenKey: 'gateway.feign.service_token',
    baseUrlConfigKey: 'gateway.feign.url',
    timeoutConfigKey: 'gateway.feign.timeout'
})
export class FeignClientFinanceManager extends FeignWebClient<FinanceTypes.FinanceFeignImplementation> {
    constructor(service?: FinanceTypes.FinanceFeignImplementation, configService?: ConfigService) {
        super(service, configService)
    }

    /**按国家/地区主键批量获取短信基础价格**/
    @FeignPost('/rates/sms/batch')
    async httpBaseFinanceBatchSmsRate(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: FinanceTypes.FinanceSmsRateBatchRequest
    ): Promise<FinanceTypes.FinanceSmsRate[]> {
        return this.dispatch('httpBaseFinanceBatchSmsRate', _authorization, _input)
    }

    /**按币种获取最新汇率**/
    @FeignPost('/currency/exchange/resolve')
    async httpBaseFinanceCurrencyExchangeResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: FinanceTypes.FinanceCurrencyExchangeResolveRequest
    ): Promise<FinanceTypes.FinanceCurrencyExchange> {
        return this.dispatch('httpBaseFinanceCurrencyExchangeResolver', _authorization, _input)
    }

    /**触发财务服务拉取并同步最新币种汇率**/
    @FeignPost('/currency/exchange/sync')
    async httpBaseFinanceSyncCurrencyExchange(
        @FeignHeader('authorization') _authorization: string
    ): Promise<FinanceTypes.FinanceCurrencyExchangeSyncResponse> {
        return this.dispatch('httpBaseFinanceSyncCurrencyExchange', _authorization)
    }
}
