import type { ConfigService } from '@nestjs/config'
import { resolveFeignServiceAuthorization } from '../feign.authorization'
import { ACCOUNT_SYSTEM_NAME, ACCOUNT_SYSTEM_UID } from './feign-account.constants'
import type { FeignClientAccountManager } from './feign-account.client.controller'
import type * as AccountTypes from './feign-account.interface'

/** 账号服务批量还原接口单次允许查询的 UID 数量上限。 */
const ACCOUNT_USER_RESOLVE_LIMIT = 100

/** 账号还原工具的扩展配置。 */
export interface AppendAccountUserOptionsConfig {
    /** 需要返回的账号字段，缺省返回 uid、number、name、avatar；uid 始终返回。 */
    fields?: AccountTypes.AccountUserField[]
}

/** 判断字段值是否为可用于账号还原的 UID。 */
function isAccountUid(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0
}

/** 系统账号固定展示为「系统」，不请求 Account 服务。 */
const ACCOUNT_SYSTEM_OPTION: AccountTypes.AccountUserOption = { uid: ACCOUNT_SYSTEM_UID, name: ACCOUNT_SYSTEM_NAME }

/** 把账号摘要转换为列表展示选项，空值字段不输出。 */
function toAccountUserOption(user: AccountTypes.AccountUserSummary): AccountTypes.AccountUserOption {
    return Object.fromEntries(
        Object.entries(user).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ) as AccountTypes.AccountUserOption
}

/**
 * 按列表字段批量调用账号 Feign，把操作人 UID 还原为 `<字段名>Options`。
 *
 * - 多个字段、多行数据中的 UID 统一去重，并按账号服务上限分批请求；
 * - Authorization 固定使用服务间凭据，不转发终端用户令牌；
 * - 返回字段默认 uid、number、name、avatar，可通过 config.fields 扩展；
 * - 系统账号 `0` 固定返回 `{ uid: '0', name: '系统' }`，不请求 Account 服务；
 * - 账号不存在时保留 `{ uid }`，避免单个账号异常导致整个列表不可用；
 * - 字段为空时对应的 `<字段名>Options` 返回 undefined。
 *
 * @example
 * await appendAccountUserOptions(accountFeignClient, configService, list, ['createBy', 'modifyBy'])
 * await appendAccountUserOptions(accountFeignClient, configService, list, ['modifyBy'], { fields: ['uid', 'name', 'phone'] })
 */
export async function appendAccountUserOptions<TItem extends object, const TKey extends keyof TItem & string>(
    accountFeignClient: FeignClientAccountManager,
    configService: ConfigService,
    list: TItem[],
    keys: readonly TKey[],
    config: AppendAccountUserOptionsConfig = {}
): Promise<Array<AccountTypes.WithAccountUserOptions<TItem, TKey>>> {
    const uids = [...new Set(list.flatMap(item => keys.map(key => item[key] as unknown)).filter(isAccountUid))].filter(
        uid => uid !== ACCOUNT_SYSTEM_UID
    )
    const options = new Map<string, AccountTypes.AccountUserOption>([[ACCOUNT_SYSTEM_UID, ACCOUNT_SYSTEM_OPTION]])
    if (uids.length > 0) {
        const authorization = resolveFeignServiceAuthorization(configService)
        const groups = Array.from({ length: Math.ceil(uids.length / ACCOUNT_USER_RESOLVE_LIMIT) }, (_, index) =>
            uids.slice(index * ACCOUNT_USER_RESOLVE_LIMIT, (index + 1) * ACCOUNT_USER_RESOLVE_LIMIT)
        )
        const users = await Promise.all(
            groups.map(group =>
                accountFeignClient.httpBaseAccountColumnUserResolver(authorization, {
                    uids: group,
                    ...(config.fields ? { fields: config.fields } : {})
                })
            )
        )
        for (const user of users.flat()) {
            options.set(user.uid, toAccountUserOption(user))
        }
    }
    return list.map(item => {
        const result = { ...item } as Record<string, unknown>
        for (const key of keys) {
            const uid: unknown = item[key]
            result[`${key}Options`] = isAccountUid(uid) ? (options.get(uid) ?? { uid }) : undefined
        }
        return result as AccountTypes.WithAccountUserOptions<TItem, TKey>
    })
}
