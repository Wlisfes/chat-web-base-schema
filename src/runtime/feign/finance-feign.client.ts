import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from './feign.decorator'

export interface FinanceSmsRate {
    countryKeyId: number
    code: string
    mcc: string
    cnName: string
    enName: string
    upUsd: number
    downUsd: number
}

export interface FinanceCurrencyExchange {
    currency: string
    rate: number
    rateDate: string
}

/**单项汇率同步请求。*/
export interface FinanceCurrencyExchangeSyncRate {
    currency: string
    rate: number
}

/**批量汇率同步请求。*/
export interface FinanceCurrencyExchangeSyncRequest {
    date: string
    rates: FinanceCurrencyExchangeSyncRate[]
}

/**汇率同步结果项。*/
export interface FinanceCurrencyExchangeSyncItem {
    currency: string
    rate: number
    date: string
}

/**批量汇率同步响应。*/
export interface FinanceCurrencyExchangeSyncResponse {
    date: string
    count: number
    list: FinanceCurrencyExchangeSyncItem[]
}

export interface FinanceSmsRateBatchRequest {
    countryKeyIds: number[]
}

@FeignClient({
    name: '财务服务',
    baseUrlConfigKey: 'FINANCE_SERVICE_URL',
    defaultBaseUrl: 'http://chat-web-finance-service:5030',
    timeoutConfigKey: 'FINANCE_SERVICE_TIMEOUT_MS',
    defaultTimeoutMs: 5000
})
export class FinanceFeignClient {
    @FeignPost('/rates/sms/batch')
    batchSmsRates(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: FinanceSmsRateBatchRequest
    ): Promise<FinanceSmsRate[]> {
        throw new Error('FinanceFeignClient 必须由 FeignModule 注入')
    }

    @FeignGet('/currency/exchange/resolver')
    resolveCurrencyExchange(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('currency') _currency: string
    ): Promise<FinanceCurrencyExchange> {
        throw new Error('FinanceFeignClient 必须由 FeignModule 注入')
    }

    @FeignPost('/currency/exchange/sync')
    syncCurrencyExchange(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: FinanceCurrencyExchangeSyncRequest
    ): Promise<FinanceCurrencyExchangeSyncResponse> {
        throw new Error('FinanceFeignClient 必须由 FeignModule 注入')
    }
}
