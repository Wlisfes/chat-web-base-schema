/**财务服务短信基础价格数据，供 CRM 报价流程使用。*/
export interface FinanceSmsRate {
    /**国家/地区主键。*/
    countryKeyId: number
    /**国际电话区号。*/
    code: string
    /**移动国家代码。*/
    mcc: string
    /**国家/地区中文名称。*/
    cnName: string
    /**国家/地区英文名称。*/
    enName: string
    /**上行短信美元单价。*/
    upUsd: number
    /**下行短信美元单价。*/
    downUsd: number
}

/**财务服务币种汇率数据。*/
export interface FinanceCurrencyExchange {
    /**币种编码。*/
    currency: string
    /**基于 USD 的汇率。*/
    rate: number
    /**汇率日期。*/
    rateDate: string
}

/**单项汇率同步请求。*/
export interface FinanceCurrencyExchangeSyncRate {
    /**币种编码。*/
    currency: string
    /**基于 USD 的汇率。*/
    rate: number
}

/**批量汇率同步请求。*/
export interface FinanceCurrencyExchangeSyncRequest {
    /**汇率日期。*/
    date: string
    /**待同步的币种汇率列表。*/
    rates: FinanceCurrencyExchangeSyncRate[]
}

/**汇率同步结果项。*/
export interface FinanceCurrencyExchangeSyncItem {
    /**币种编码。*/
    currency: string
    /**基于 USD 的汇率。*/
    rate: number
    /**实际写入的汇率日期。*/
    date: string
}

/**批量汇率同步响应。*/
export interface FinanceCurrencyExchangeSyncResponse {
    /**实际同步的汇率日期。*/
    date: string
    /**已同步的币种数量。*/
    count: number
    /**已同步的币种汇率列表。*/
    list: FinanceCurrencyExchangeSyncItem[]
}

/**按国家/地区主键批量查询短信基础价格的请求。*/
export interface FinanceSmsRateBatchRequest {
    /**国家/地区主键列表。*/
    countryKeyIds: number[]
}
