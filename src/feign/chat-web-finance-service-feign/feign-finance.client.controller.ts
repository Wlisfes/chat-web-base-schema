import { FeignClient, FeignHeader, FeignPost, FeignBody } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as FinanceTypes from './feign-finance.interface'

@FeignClient({
    name: '财务服务',
    prefix: 'feign',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.chat-web-finance.url',
    timeoutConfigKey: 'feign.chat-web-finance.timeout'
})
export class FeignClientFinanceManager extends FeignWebClient<FinanceTypes.FinanceFeignImplementation> {
    constructor(service?: FinanceTypes.FinanceFeignImplementation) {
        super(service)
    }

    /**批量同步指定日期的币种汇率**/
    @FeignPost('/currency/exchange/sync')
    async httpSyncCurrencyExchange(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: FinanceTypes.FinanceCurrencyExchangeSyncRequest
    ): Promise<FinanceTypes.FinanceCurrencyExchangeSyncResponse> {
        return this.dispatch('httpSyncCurrencyExchange', _authorization, _input)
    }
}
