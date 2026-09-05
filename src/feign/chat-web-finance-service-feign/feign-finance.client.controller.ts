import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as FinanceTypes from './feign-finance.interface'

/**
 * 财务服务 Feign 客户端。
 *
 * 财务服务通过常规业务 Controller 暴露这些接口，并由自身的 FinanceAuthGuard 完成鉴权：
 * 报价查询类接口需要终端用户令牌，汇率同步接口另行声明允许服务间凭据。因此这里不声明
 * `feign` 路径前缀，也不在客户端侧强制服务凭据。
 */
@FeignClient({
    name: '财务服务',
    baseUrlConfigKey: 'feign.chat-web-finance.url',
    timeoutConfigKey: 'feign.chat-web-finance.timeout'
})
export class FeignClientFinanceManager extends FeignWebClient<FinanceTypes.FinanceFeignImplementation> {
    constructor(service?: FinanceTypes.FinanceFeignImplementation) {
        super(service)
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
