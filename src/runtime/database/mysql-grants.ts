function unquoteIdentifier(value: string): string | undefined {
    const match = value.match(/^`((?:``|[^`])+)`$/)
    if (match) return match[1].replaceAll('``', '`')
    return /^[A-Za-z0-9_-]+$/.test(value) ? value : undefined
}

/**
 * 拒绝业务服务账号拥有全局权限、其他数据库权限或角色授权。
 * `USAGE ON *.*` 是 MySQL 表示账号存在但没有全局权限的固定语句，允许保留。
 */
export function assertMysqlDatabaseIsolation(grants: readonly string[], expectedDatabase: string): void {
    if (!grants.length) throw new Error('无法读取当前 MySQL 账号授权')

    for (const statement of grants) {
        const match = statement.match(/^GRANT\s+(.+?)\s+ON\s+(.+?)\s+TO\s+/i)
        if (!match) {
            throw new Error('MySQL 业务账号不得通过角色或非数据库授权继承权限')
        }
        const privileges = match[1].trim().toUpperCase()
        const target = match[2].trim()
        if (target === '*.*') {
            if (privileges === 'USAGE') continue
            throw new Error('MySQL 业务账号不得拥有全局权限')
        }

        const separator = target.indexOf('.')
        const database = separator > 0 ? unquoteIdentifier(target.slice(0, separator)) : undefined
        if (database !== expectedDatabase) {
            throw new Error(`MySQL 业务账号只能访问数据库：${expectedDatabase}`)
        }
    }
}
