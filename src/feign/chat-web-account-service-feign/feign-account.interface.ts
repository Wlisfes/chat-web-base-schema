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

/**批量查询账号展示摘要的请求体。*/
export interface AccountUserBatchRequest {
    /**待查询的账号 UID 集合，单次上限 100 个。*/
    uids: string[]
}

/** 账号服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientAccountImplementation {
    /**批量把账号 UID 还原为展示摘要**/
    httpBaseAccountBatchUserResolver(authorization: string, input: AccountUserBatchRequest): Promise<AccountUserSummary[]>
}
