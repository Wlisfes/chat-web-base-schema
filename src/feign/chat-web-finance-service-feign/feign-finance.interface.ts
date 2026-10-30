import type { TbFinanceBrandStatus, TbFinanceSrmUserWalletPayMode } from '@/schema/chat-web-finance-mysql'

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
    /**按国家/地区主键批量获取 simbank 基础成本价格**/
    httpBaseFinanceColumnFrozenSimbankResolver(
        authorization: string,
        input: FinanceColumnFrozenSmsResolverRequest
    ): Promise<FinanceFrozenSimbankSummary[]>
    /**按供应商主键批量获取供应商钱包余额和信用额度，没有钱包时金额为 0**/
    httpBaseFinanceColumnSrmUserResolver(
        authorization: string,
        input: FinanceColumnSrmUserResolverRequest
    ): Promise<FinanceSrmUserSummary[]>
    /**为新建供应商创建一个钱包，并把钱包快照写入 Redis。已有钱包时不重置余额，只刷新 Redis。**/
    httpBaseFinanceCreateSrmUserWallet(authorization: string, input: FinanceCreateSrmUserWalletRequest): Promise<FinanceSrmUserWallet>
    /**把 Redis 中的供应商钱包余额同步回钱包表；Redis 缺少钱包时用钱包表补齐 Redis**/
    httpBaseFinanceSyncSrmUserWallet(authorization: string): Promise<FinanceSrmUserWalletSyncResponse>
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

/**财务服务 simbank 基础成本价格摘要，供 SRM 供应商报价流程使用；字段与短信基础价格一致。*/
export type FinanceFrozenSimbankSummary = FinanceFrozenSmsSummary

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

/**批量汇率同步响应；count、list 为原有字段保持不变，其余为执行统计，供任务结果和日志展示。*/
export interface FinanceCurrencyExchangeSyncResponse {
    /**实际同步的汇率日期。*/
    date: string
    /**已同步（本次新增）的币种数量。*/
    count: number
    /**已同步（本次新增）的币种汇率列表。*/
    list: FinanceCurrencyExchangeSyncItem[]
    /**汇率数据来源，例如 Open Exchange Rates。*/
    source?: string
    /**外部数据源返回的有效币种数量。*/
    fetched?: number
    /**系统中已启用的币种数量。*/
    enabled?: number
    /**本次新增写入的币种数量，等同于 count。*/
    inserted?: number
    /**当天已存在、本次跳过的币种数量。*/
    skipped?: number
    /**本次新增的币种代码。*/
    insertedCurrencies?: string[]
    /**当天已存在、本次跳过的币种代码。*/
    skippedCurrencies?: string[]
    /**已启用但外部数据源未返回汇率的币种代码。*/
    missingCurrencies?: string[]
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

/**按供应商主键批量查询供应商钱包的请求。*/
export interface FinanceColumnSrmUserResolverRequest {
    /**SRM 供应商主键列表，单次上限 100 个。*/
    userKeyIds: number[]
}

/**新建供应商钱包的请求。*/
export interface FinanceCreateSrmUserWalletRequest {
    /**SRM 供应商主键。*/
    userKeyId: number
    /**财务币种编码。*/
    currency: string
    /**付款模式。*/
    payMode: TbFinanceSrmUserWalletPayMode
    /**信用额度（放大百万倍存储值）。不传时为 0。*/
    credit?: number
}

/**供应商钱包：余额的权威快照，同时写入 Redis 供后续扣费读取。*/
export interface FinanceSrmUserWallet {
    /**SRM 供应商主键。*/
    userKeyId: number
    /**财务币种编码。*/
    currency: string
    /**付款模式。*/
    payMode: TbFinanceSrmUserWalletPayMode
    /**余额（放大百万倍存储值）：按钱包币种计。*/
    balance: number
    /**信用额度（放大百万倍存储值）：按钱包币种计。*/
    credit: number
}

/**供应商钱包余额同步结果：只返回统计数量，不返回余额明细。*/
export interface FinanceSrmUserWalletSyncResponse {
    /**参与同步的钱包数量。*/
    total: number
    /**本次按 Redis 余额写回钱包表的数量。*/
    updated: number
    /**保留字段。同步不再逐个比对，固定为 0。*/
    unchanged: number
    /**保留字段。同步不再用钱包表补齐 Redis，固定为 0。*/
    restored: number
    /**Redis 余额格式错误、本次跳过的供应商主键。*/
    invalidUserKeyIds: number[]
}

/**供应商钱包金额摘要：余额和信用额度取 Redis 最新值。没有钱包时金额为 0。*/
export interface FinanceSrmUserSummary {
    /**SRM 供应商主键。*/
    userKeyId: number
    /**余额（放大百万倍存储值）：按钱包币种计。*/
    balance: number
    /**信用额度（放大百万倍存储值）：按钱包币种计。*/
    credit: number
}
