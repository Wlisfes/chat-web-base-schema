import type { ConfigService } from '@nestjs/config'
import { resolveFeignServiceAuthorization } from '../feign.authorization'
import { SKYLINE_SYSTEM_NAME, SKYLINE_SYSTEM_UID } from './feign-skyline.constants'
import type { FeignClientSkylineManager } from './feign-skyline.client.controller'
import type * as SkylineTypes from './feign-skyline.interface'

/** Skyline 账号服务批量还原接口单次允许查询的 UID 数量上限。 */
const SKYLINE_USER_RESOLVE_LIMIT = 100

/** 账号还原工具的扩展配置。 */
export interface AppendSkylineUserOptionsConfig {
    /** 需要额外返回的账号字段；uid、number、name、avatar 默认始终返回。 */
    fields?: SkylineTypes.SkylineUserField[]
}

/** 判断字段值是否为可用于账号还原的 UID。 */
function isSkylineUid(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0
}

/** 系统账号固定展示为「系统」，不请求 Skyline 服务。 */
const SKYLINE_SYSTEM_OPTION: SkylineTypes.SkylineUserOption = { uid: SKYLINE_SYSTEM_UID, name: SKYLINE_SYSTEM_NAME }

/** 把账号摘要转换为列表展示选项，空值字段不输出。 */
function toSkylineUserOption(user: SkylineTypes.SkylineUserSummary): SkylineTypes.SkylineUserOption {
    return Object.fromEntries(
        Object.entries(user).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ) as SkylineTypes.SkylineUserOption
}

/**
 * 按列表字段批量调用账号 Feign，把操作人 UID 还原为 `<字段名>Options`。
 *
 * - 多个字段、多行数据中的 UID 统一去重，并按 Skyline 账号服务上限分批请求；
 * - Authorization 固定使用服务间凭据，不转发终端用户令牌；
 * - 返回字段默认 uid、number、name、avatar，config.fields 只需声明额外字段；
 * - 系统账号 `0` 固定返回 `{ uid: '0', name: '系统' }`，不请求 Skyline 服务；
 * - 账号不存在时保留 `{ uid }`，避免单个账号异常导致整个列表不可用；
 * - 字段为空时对应的 `<字段名>Options` 返回 undefined；
 * - 直接在传入的列表项上追加字段并返回原列表引用，不创建新数组或新对象。
 *
 * @example
 * await appendSkylineUserOptions(skylineFeignClient, configService, list, ['createBy', 'modifyBy'])
 * await appendSkylineUserOptions(skylineFeignClient, configService, list, ['modifyBy'], { fields: ['phone', 'organizations'] })
 */
export async function appendSkylineUserOptions<TItem extends object, const TKey extends keyof TItem & string>(
    skylineFeignClient: FeignClientSkylineManager,
    configService: ConfigService,
    list: TItem[],
    keys: readonly TKey[],
    config: AppendSkylineUserOptionsConfig = {}
): Promise<Array<SkylineTypes.WithSkylineUserOptions<TItem, TKey>>> {
    const uids = [...new Set(list.flatMap(item => keys.map(key => item[key] as unknown)).filter(isSkylineUid))].filter(
        uid => uid !== SKYLINE_SYSTEM_UID
    )
    const options = new Map<string, SkylineTypes.SkylineUserOption>([[SKYLINE_SYSTEM_UID, SKYLINE_SYSTEM_OPTION]])
    if (uids.length > 0) {
        const authorization = resolveFeignServiceAuthorization(configService)
        const groups = Array.from({ length: Math.ceil(uids.length / SKYLINE_USER_RESOLVE_LIMIT) }, (_, index) =>
            uids.slice(index * SKYLINE_USER_RESOLVE_LIMIT, (index + 1) * SKYLINE_USER_RESOLVE_LIMIT)
        )
        const users = await Promise.all(
            groups.map(group =>
                skylineFeignClient.httpBaseSkylineColumnUserResolver(authorization, {
                    uids: group,
                    ...(config.fields ? { fields: config.fields } : {})
                })
            )
        )
        for (const user of users.flat()) {
            options.set(user.uid, toSkylineUserOption(user))
        }
    }
    for (const item of list) {
        const result = item as Record<string, unknown>
        for (const key of keys) {
            const uid: unknown = item[key]
            result[`${key}Options`] = isSkylineUid(uid) ? (options.get(uid) ?? { uid }) : undefined
        }
    }
    return list as Array<SkylineTypes.WithSkylineUserOptions<TItem, TKey>>
}
