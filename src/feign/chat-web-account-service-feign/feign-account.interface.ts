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
