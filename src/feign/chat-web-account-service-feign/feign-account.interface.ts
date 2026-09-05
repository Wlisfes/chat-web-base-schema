/**账号服务客户资料摘要，供 CRM 等服务组合业务响应使用。*/
export interface AccountConsumer {
    /**客户主键。*/
    keyId: number
    /**客户 UID。*/
    uid: string
    /**客户所属业务员 UID。*/
    ownerUserUid: string
    /**客户名称。*/
    name: string
    /**客户别名。*/
    alias?: string
    /**客户所属品牌主键。*/
    brandId: number
    /**客户结算币种。*/
    currency: string
    /**客户邮箱。*/
    email: string
    /**客户手机号。*/
    phone?: string
    /**客户状态。*/
    status: string
}

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

export interface FeignClientAccountImplementation {
    /**按客户主键获取客户详情**/
    resolveConsumer(authorization: string, keyId: number): Promise<AccountConsumer>
    /**按名称筛选客户下拉数据；不传名称时返回可用客户列表**/
    selectConsumers(authorization: string, name?: string): Promise<AccountConsumer[]>
    /**批量把账号 UID 还原为展示摘要**/
    batchResolveUsers(authorization: string, input: AccountUserBatchRequest): Promise<AccountUserSummary[]>
}
