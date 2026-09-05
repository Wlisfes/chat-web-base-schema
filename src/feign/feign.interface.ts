/** 与 fetch 兼容的请求函数类型，便于测试时替换真实网络请求。 */
export type FeignFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

/** Feign 客户端构造函数类型。 */
export type FeignClientConstructor<TClient extends object = object> = new () => TClient

/** 当前运行时支持的 HTTP 方法。 */
export type FeignHttpMethod = 'GET' | 'POST'

/** Feign 客户端的服务级配置。 */
export interface FeignClientOptions {
    /** 服务显示名称，用于异常信息和日志。 */
    name: string
    /** 所有接口共用的路径前缀，例如 `feign` 或 `/feign`。 */
    prefix?: string
    /** 服务令牌对应的 ConfigService 配置键；访问令牌内省类接口可以不配置。 */
    serviceTokenKey?: string
    /** 服务地址对应的 ConfigService 配置键。 */
    baseUrlConfigKey: string
    /** 请求超时对应的 ConfigService 配置键。 */
    timeoutConfigKey: string
}

/** Feign 方法的 HTTP 方法和相对路径定义。 */
export interface FeignMethodOptions {
    /** 请求使用的 HTTP 方法。 */
    method: FeignHttpMethod
    /** 以 `/` 开头的服务端相对路径。 */
    path: string
}

/** Feign 方法参数的绑定类型。 */
export type FeignParameterKind = 'body' | 'header' | 'query'

/** Feign 方法参数与 HTTP 请求位置的绑定定义。 */
export interface FeignParameterOptions {
    /** 参数在方法参数列表中的位置。 */
    index: number
    /** 参数写入请求体、请求头或查询字符串的位置。 */
    kind: FeignParameterKind
    /** 请求头或查询参数名称。 */
    name?: string
}

/** 包含参数绑定信息的完整 Feign 方法定义。 */
export interface FeignMethodDefinition extends FeignMethodOptions {
    /** 方法参数绑定列表。 */
    parameters: FeignParameterOptions[]
}

/** 远程服务统一响应包装结构。 */
export interface FeignApiEnvelope {
    /** 业务响应码，通常为 200 表示成功。 */
    code?: unknown
    /** 业务响应数据。 */
    data?: unknown
    /** 业务响应消息。 */
    message?: unknown
}
