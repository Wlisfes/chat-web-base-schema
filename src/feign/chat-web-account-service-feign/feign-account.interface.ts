import type { TbAccountUserEmploymentStatus, TbAccountUserStatus } from '@/schema/chat-web-account-mysql'
import type { ACCOUNT_USER_RESOLVER_FIELDS } from './feign-account.constants'

/**账号批量还原允许返回的字段。*/
export type AccountUserField = (typeof ACCOUNT_USER_RESOLVER_FIELDS)[number]

/**账号服务用户展示摘要，供跨服务把操作人 UID 还原为可读信息使用；扩展字段只在请求 fields 时返回。*/
export interface AccountUserSummary {
    /**账号 UID。*/
    uid: string
    /**账号工号。*/
    number?: string
    /**账号姓名。*/
    name?: string
    /**账号头像。*/
    avatar?: string
    /**账号手机号，仅请求 phone 时返回。*/
    phone?: string
    /**账号邮箱，仅请求 email 时返回。*/
    email?: string
    /**账号状态，仅请求 status 时返回。*/
    status?: TbAccountUserStatus
    /**员工在职状态，仅请求 employmentStatus 时返回。*/
    employmentStatus?: TbAccountUserEmploymentStatus
}

/**列表展示使用的账号选项；字段集合与请求 fields 一致，账号不存在时只保留 uid。*/
export type AccountUserOption = AccountUserSummary

/**为指定 UID 字段追加 `<字段名>Options` 后的列表项类型。*/
export type WithAccountUserOptions<TItem, TKey extends keyof TItem & string> = TItem & {
    [K in TKey as `${K}Options`]?: AccountUserOption
}

/**按列表批量还原账号展示摘要的请求体。*/
export interface AccountColumnUserResolverRequest {
    /**待查询的账号 UID 集合，单次上限 100 个。*/
    uids: string[]
    /**需要返回的账号字段，缺省返回 uid、number、name、avatar；uid 始终返回。*/
    fields?: AccountUserField[]
}

/**按账号 UID 还原单个展示摘要的请求体。*/
export interface AccountUserResolverRequest {
    /**待查询的账号 UID。*/
    uid: string
    /**需要返回的账号字段，缺省返回 uid、number、name、avatar；uid 始终返回。*/
    fields?: AccountUserField[]
}

/** 账号服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientAccountImplementation {
    /**按列表批量把账号 UID 还原为展示摘要**/
    httpBaseAccountColumnUserResolver(authorization: string, input: AccountColumnUserResolverRequest): Promise<AccountUserSummary[]>
    /**按账号 UID 还原单个展示摘要**/
    httpBaseAccountUserResolver(authorization: string, input: AccountUserResolverRequest): Promise<AccountUserSummary>
}
