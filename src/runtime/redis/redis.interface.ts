/** Redis 客户端从 Nacos `redis` 节点读取的配置。 */
export interface RedisConfig {
    /** Redis 连接 URL；配置后优先于 host/port。 */
    url?: string
    /** Redis 服务地址，默认 `chat-web-redis`。 */
    host?: string
    /** Redis 服务端口，默认 `6379`。 */
    port?: number | string
    /** Redis 逻辑数据库编号。服务必须使用自己的固定编号。 */
    database?: number | string
    /** Redis 用户名，可选。 */
    username?: string
    /** Redis 密码，可选。 */
    password?: string
    /** 是否使用 TLS，默认 `false`。 */
    tls?: boolean | string
    /** 建立连接的超时时间，单位毫秒，默认 `5000`。 */
    connectTimeoutMs?: number | string
}

/** RedisModule 的服务边界与配置节点选项。 */
export interface RedisRuntimeOptions {
    /** 本服务允许使用的 Redis 逻辑数据库编号，范围 `0-15`。 */
    database: number
    /** Nacos 中的配置节点键名，默认 `redis`。 */
    configKey?: string
}

/** `RedisRuntimeOptions` 的 NestJS 注入令牌。 */
export const REDIS_RUNTIME_OPTIONS = Symbol('REDIS_RUNTIME_OPTIONS')
