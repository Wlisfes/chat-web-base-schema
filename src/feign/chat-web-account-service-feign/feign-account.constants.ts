/** 系统账号 UID：种子数据、定时任务等非人工操作统一记为该值，不对应 Account 真实账号。 */
export const ACCOUNT_SYSTEM_UID = '0'

/** 系统账号展示名称。 */
export const ACCOUNT_SYSTEM_NAME = '系统'

/** 账号批量还原默认返回的展示字段，始终返回，fields 在其基础上追加。 */
export const ACCOUNT_USER_RESOLVER_DEFAULT_FIELDS = ['uid', 'number', 'name', 'avatar'] as const

/** 账号批量还原中需要关联查询、不对应 tb_account_user 列的扩展字段。 */
export const ACCOUNT_USER_RESOLVER_RELATION_FIELDS = ['organizations'] as const

/**
 * 账号批量还原允许扩展返回的字段白名单。
 *
 * 只允许声明的展示字段，禁止返回密码等敏感列；新增字段时必须同步 Account 服务查询与响应文档。
 */
export const ACCOUNT_USER_RESOLVER_FIELDS = [
    ...ACCOUNT_USER_RESOLVER_DEFAULT_FIELDS,
    'phone',
    'email',
    'status',
    'employmentStatus',
    'organizations'
] as const
