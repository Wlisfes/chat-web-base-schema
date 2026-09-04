import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'
import type * as FinanceTypes from './feign-finance.interface'

/**财务服务 Feign 客户端，供其他微服务调用短信价格和汇率接口。*/
@FeignClient({
    name: '财务服务',
    baseUrlConfigKey: 'feign.chat-web-finance.url',
    timeoutConfigKey: 'feign.chat-web-finance.timeout'
})
export class FeignClientFinance {
    /**按国家/地区主键批量获取短信基础价格。*/
    @FeignPost('/rates/sms/batch')
    batchSmsRates(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: FinanceTypes.FinanceSmsRateBatchRequest
    ): Promise<FinanceTypes.FinanceSmsRate[]> {
        throw new Error('FeignClientFinance 必须由 FeignModule 注入')
    }

    /**按币种获取最新汇率。*/
    @FeignGet('/currency/exchange/resolver')
    resolveCurrencyExchange(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('currency') _currency: string
    ): Promise<FinanceTypes.FinanceCurrencyExchange> {
        throw new Error('FeignClientFinance 必须由 FeignModule 注入')
    }

    /**批量同步指定日期的币种汇率。*/
    @FeignPost('/currency/exchange/sync')
    syncCurrencyExchange(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: FinanceTypes.FinanceCurrencyExchangeSyncRequest
    ): Promise<FinanceTypes.FinanceCurrencyExchangeSyncResponse> {
        throw new Error('FeignClientFinance 必须由 FeignModule 注入')
    }
}
