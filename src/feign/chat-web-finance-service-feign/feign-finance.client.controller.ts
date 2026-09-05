import { ConfigService } from '@nestjs/config'
import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as FinanceTypes from './feign-finance.interface'

/**
 * 财务服务业务 Feign 客户端。
 *
 * 价格与汇率属于跨服务基础参考数据，不做用户级数据隔离，因此统一使用服务间凭据调用；
 * 面向管理端的同名业务路由仍由 FinanceAuthGuard 校验终端用户令牌，两者互不影响。
 */
@FeignClient({
    name: '财务服务',
    prefix: '/feign/finance',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.gateway.url',
    timeoutConfigKey: 'feign.gateway.timeout'
})
export class FeignClientFinanceManager extends FeignWebClient<FinanceTypes.FinanceFeignImplementation> {
    constructor(service?: FinanceTypes.FinanceFeignImplementation, configService?: ConfigService) {
        super(service, configService)
    }

    /**按国家/地区主键批量获取短信基础价格**/
    @FeignPost('/rates/sms/batch')
    async batchSmsRates(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: FinanceTypes.FinanceSmsRateBatchRequest
    ): Promise<FinanceTypes.FinanceSmsRate[]> {
        return this.dispatch('batchSmsRates', _authorization, _input)
    }

    /**按币种获取最新汇率**/
    @FeignGet('/currency/exchange/resolver')
    async resolveCurrencyExchange(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('currency') _currency: string
    ): Promise<FinanceTypes.FinanceCurrencyExchange> {
        return this.dispatch('resolveCurrencyExchange', _authorization, _currency)
    }

    /**批量同步指定日期的币种汇率**/
    @FeignPost('/currency/exchange/sync')
    async syncCurrencyExchange(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: FinanceTypes.FinanceCurrencyExchangeSyncRequest
    ): Promise<FinanceTypes.FinanceCurrencyExchangeSyncResponse> {
        return this.dispatch('syncCurrencyExchange', _authorization, _input)
    }
}
