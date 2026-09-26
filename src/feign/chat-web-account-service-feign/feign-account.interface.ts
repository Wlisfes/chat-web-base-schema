/**账号服务用户展示摘要，供跨服务把操作人 UID 还原为可读信息使用。*/
export interface AccountUserSummary {
    /**账号 UID。*/
    uid: string
    /**账号工号。*/
    number: string
    /**账号姓名。*/
    name: string
    /**账号头像。*/
    avatar?: string
}

/**按列表批量还原账号展示摘要的请求体。*/
export interface AccountColumnUserResolverRequest {
    /**待查询的账号 UID 集合，单次上限 100 个。*/
    uids: string[]
}

/**按账号 UID 还原单个展示摘要的请求体。*/
export interface AccountUserResolverRequest {
    /**待查询的账号 UID。*/
    uid: string
}

/** 账号服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientAccountImplementation {
    /**按列表批量把账号 UID 还原为展示摘要**/
    httpBaseAccountColumnUserResolver(authorization: string, input: AccountColumnUserResolverRequest): Promise<AccountUserSummary[]>
    /**按账号 UID 还原单个展示摘要**/
    httpBaseAccountUserResolver(authorization: string, input: AccountUserResolverRequest): Promise<AccountUserSummary>
}
