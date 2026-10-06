import type { TbFinanceBrandStatus } from '@/schema/chat-web-finance-mysql'

/** 财务服务 Feign 服务端实现必须满足的接口。 */
export interface FinanceFeignImplementation {
    /**按品牌主键批量获取品牌展示摘要**/
    httpBaseFinanceColumnBrandResolver(authorization: string, input: FinanceColumnBrandResolverRequest): Promise<FinanceBrandSummary[]>
    /**按品牌主键获取单个品牌展示摘要**/
    httpBaseFinanceBrandResolver(authorization: string, input: FinanceBrandResolverRequest): Promise<FinanceBrandSummary>
    /**按国家/地区主键批量获取短信基础价格**/
    httpBaseFinanceColumnFrozenSmsResolver(
        authorization: string,
        input: FinanceColumnFrozenSmsResolverRequest
    ): Promise<FinanceFrozenSmsSummary[]>
    /**按国家/地区主键获取单个短信基础价格**/
    httpBaseFinanceFrozenSmsResolver(authorization: string, input: FinanceFrozenSmsResolverRequest): Promise<FinanceFrozenSmsSummary>
    /**按币种获取最新汇率**/
    httpBaseFinanceCurrencyExchangeResolver(
        authorization: string,
        input: FinanceCurrencyExchangeResolveRequest
    ): Promise<FinanceCurrencyExchange>
    /**触发财务服务拉取并同步最新币种汇率**/
    httpBaseFinanceSyncCurrencyExchange(authorization: string): Promise<FinanceCurrencyExchangeSyncResponse>
}

/**财务服务短信基础价格摘要，供 CRM 报价流程使用。*/
export interface FinanceFrozenSmsSummary {
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
    /**上行短信美元单价（放大百万倍存储值）。*/
    upUsd: number
    /**下行短信美元单价（放大百万倍存储值）。*/
    downUsd: number
}

/**财务服务币种汇率数据。*/
export interface FinanceCurrencyExchange {
    /**币种编码。*/
    currency: string
    /**基于 USD 的汇率。*/
    rate: number
    /**汇率日期。*/
    date: string
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

/**按币种查询最新汇率的请求。*/
export interface FinanceCurrencyExchangeResolveRequest {
    /**币种编码。*/
    currency: string
}

/**按国家/地区主键批量查询短信基础价格的请求。*/
export interface FinanceColumnFrozenSmsResolverRequest {
    /**国家/地区主键列表，单次上限 100 个。*/
    countryKeyIds: number[]
}

/**按国家/地区主键查询单个短信基础价格的请求。*/
export interface FinanceFrozenSmsResolverRequest {
    /**国家/地区主键。*/
    countryKeyId: number
}

/**按品牌主键批量查询品牌展示摘要的请求。*/
export interface FinanceColumnBrandResolverRequest {
    /**品牌主键列表，单次上限 100 个。*/
    keyIds: number[]
}

/**按品牌主键查询单个品牌展示摘要的请求。*/
export interface FinanceBrandResolverRequest {
    /**品牌主键。*/
    keyId: number
}

/**品牌展示摘要。*/
export interface FinanceBrandSummary {
    /**品牌主键。*/
    keyId: number
    /**品牌名称。*/
    name: string
    /**品牌状态。*/
    status: TbFinanceBrandStatus
}

/**列表品牌展示选项；品牌不存在时只保留 keyId。*/
export type FinanceBrandOption = Pick<FinanceBrandSummary, 'keyId'> & Partial<Omit<FinanceBrandSummary, 'keyId'>>

/**为列表数据追加 `<字段名>Options` 品牌展示字段后的类型。*/
export type WithFinanceBrandOptions<TItem, TKey extends keyof TItem & string> = TItem & {
    [K in TKey as `${K}Options`]?: FinanceBrandOption
}
