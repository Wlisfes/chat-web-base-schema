import type { ConfigService } from '@nestjs/config'
import { resolveFeignServiceAuthorization } from '../feign.authorization'
import type { FeignClientFinanceManager } from './feign-finance.client.controller'
import type * as FinanceTypes from './feign-finance.interface'

/** 财务服务品牌批量还原接口单次允许查询的主键数量上限。 */
const FINANCE_BRAND_RESOLVE_LIMIT = 100

/** 判断字段值是否为可用于品牌还原的主键。 */
function isFinanceBrandKeyId(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0
}

/**
 * 按列表字段批量调用财务 Feign，把品牌主键还原为 `<字段名>Options`。
 *
 * - 多个字段、多行数据中的品牌主键统一去重，并按财务服务上限分批请求；
 * - Authorization 固定使用服务间凭据，不转发终端用户令牌；
 * - 品牌不存在时保留 `{ keyId }`，字段为空时对应的 `<字段名>Options` 返回 undefined；
 * - 直接在传入的列表项上追加字段并返回原列表引用，不创建新数组或新对象。
 *
 * @example
 * await appendFinanceBrandOptions(financeFeignClient, configService, list, ['brandKeyId'])
 */
export async function appendFinanceBrandOptions<TItem extends object, const TKey extends keyof TItem & string>(
    financeFeignClient: FeignClientFinanceManager,
    configService: ConfigService,
    list: TItem[],
    keys: readonly TKey[]
): Promise<Array<FinanceTypes.WithFinanceBrandOptions<TItem, TKey>>> {
    const keyIds = [...new Set(list.flatMap(item => keys.map(key => item[key] as unknown)).filter(isFinanceBrandKeyId))]
    const options = new Map<number, FinanceTypes.FinanceBrandOption>()
    if (keyIds.length > 0) {
        const authorization = resolveFeignServiceAuthorization(configService)
        const groups = Array.from({ length: Math.ceil(keyIds.length / FINANCE_BRAND_RESOLVE_LIMIT) }, (_, index) =>
            keyIds.slice(index * FINANCE_BRAND_RESOLVE_LIMIT, (index + 1) * FINANCE_BRAND_RESOLVE_LIMIT)
        )
        const brands = await Promise.all(
            groups.map(group => financeFeignClient.httpBaseFinanceColumnBrandResolver(authorization, { keyIds: group }))
        )
        for (const brand of brands.flat()) {
            options.set(brand.keyId, { keyId: brand.keyId, name: brand.name, status: brand.status })
        }
    }
    for (const item of list) {
        const result = item as Record<string, unknown>
        for (const key of keys) {
            const keyId: unknown = item[key]
            result[`${key}Options`] = isFinanceBrandKeyId(keyId) ? (options.get(keyId) ?? { keyId }) : undefined
        }
    }
    return list as Array<FinanceTypes.WithFinanceBrandOptions<TItem, TKey>>
}
