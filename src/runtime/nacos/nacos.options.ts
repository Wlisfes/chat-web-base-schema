import { NacosRuntimeOptions } from './nacos.interface'

/**
 * 业务服务传给 `createNacosRuntimeOptions()` 的扁平参数。
 *
 * 调用处必须提供 `serviceName`、`registerPort`、`NACOS_SERVER` 和
 * `NACOS_NAMESPACE`；其中 `registerPort` 通常映射 `.env` 的 `PORT`。
 * 其余环境变量均可省略并使用各字段声明的默认值。
 */
export interface NacosRuntimeOptionsInput {
    /** 服务固有名称；未配置 `NACOS_SERVICE_NAME` 时使用。 */
    serviceName: string
    /** 当前服务监听端口，通常传入 `process.env.PORT`；同时作为默认注册端口。 */
    registerPort: string | number | undefined
    /** Nacos 配置中心与注册中心地址。必填。 */
    NACOS_SERVER: string | undefined
    /** Nacos namespace ID。必填。 */
    NACOS_NAMESPACE: string | undefined
    /** Nacos 认证用户名；未开启认证时不配置。 */
    NACOS_USERNAME?: string
    /** Nacos 认证密码；未开启认证时不配置。 */
    NACOS_PASSWORD?: string
    /** 配置中心请求超时时间，单位毫秒；默认 `5000`。 */
    NACOS_REQUEST_TIMEOUT?: string
    /** 配置 Data ID；默认 `${serviceName}.yaml`。 */
    NACOS_CONFIG_DATA_ID?: string
    /** 配置订阅组；默认 `DEFAULT_GROUP`。 */
    NACOS_CONFIG_GROUP?: string
    /** 是否注册服务实例，只接受 `true` 或 `false`；默认 `true`。 */
    NACOS_REGISTER_ENABLED?: string
    /** 注册失败是否阻止应用启动，只接受 `true` 或 `false`；默认 `false`。 */
    NACOS_REGISTER_REQUIRED?: string
    /** Nacos 服务名称；默认使用调用方提供的服务固有名称。 */
    NACOS_SERVICE_NAME?: string
    /** 服务发现组；默认使用配置订阅组。 */
    NACOS_GROUP?: string
    /** 注册实例 IP；默认自动选择非内部 IPv4。 */
    NACOS_REGISTER_IP?: string
    /** 注册实例端口；未配置时使用 `registerPort`。 */
    NACOS_REGISTER_PORT?: string
}

function optionalString(value: string | undefined): string | undefined {
    return value?.trim() || undefined
}

function requiredString(name: string, value: string | undefined): string {
    const normalized = optionalString(value)
    if (!normalized) {
        throw new Error(`${name} 必须配置为非空字符串`)
    }
    return normalized
}

function optionalBoolean(name: string, value: string | undefined): boolean | undefined {
    const normalized = optionalString(value)
    if (normalized === undefined) return undefined
    if (normalized === 'true') return true
    if (normalized === 'false') return false
    throw new Error(`${name} 必须是 true 或 false`)
}

function positiveInteger(name: string, value: string | number | undefined, maximum = Number.MAX_SAFE_INTEGER): number {
    const normalized = typeof value === 'string' ? optionalString(value) : value
    const parsed = Number(normalized)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
        throw new Error(`${name} 必须是 1-${maximum} 之间的整数`)
    }
    return parsed
}

function optionalPositiveInteger(name: string, value: string | undefined): number | undefined {
    return optionalString(value) === undefined ? undefined : positiveInteger(name, value)
}

/**
 * 将调用方显式传入的扁平化环境变量转换为类型完整的 `NacosRuntimeOptions`。
 *
 * `NACOS_SERVER` 和 `NACOS_NAMESPACE` 没有安全的跨环境默认值，因此必须提供。
 * 服务名由调用方提供，注册端口从调用方映射的 `PORT` 转换；其余空值保持
 * `undefined`，由 `NacosService` 统一应用接口文档中声明的默认值。
 */
export function createNacosRuntimeOptions(options: NacosRuntimeOptionsInput): NacosRuntimeOptions {
    const registerPortOverride = optionalString(options.NACOS_REGISTER_PORT)

    return {
        serverAddr: requiredString('NACOS_SERVER', options.NACOS_SERVER),
        namespace: requiredString('NACOS_NAMESPACE', options.NACOS_NAMESPACE),
        username: optionalString(options.NACOS_USERNAME),
        password: optionalString(options.NACOS_PASSWORD),
        requestTimeout: optionalPositiveInteger('NACOS_REQUEST_TIMEOUT', options.NACOS_REQUEST_TIMEOUT),
        configDataId: optionalString(options.NACOS_CONFIG_DATA_ID),
        configGroup: optionalString(options.NACOS_CONFIG_GROUP),
        registerEnabled: optionalBoolean('NACOS_REGISTER_ENABLED', options.NACOS_REGISTER_ENABLED),
        registerRequired: optionalBoolean('NACOS_REGISTER_REQUIRED', options.NACOS_REGISTER_REQUIRED),
        serviceName: optionalString(options.NACOS_SERVICE_NAME) ?? options.serviceName,
        discoveryGroup: optionalString(options.NACOS_GROUP),
        registerIp: optionalString(options.NACOS_REGISTER_IP),
        registerPort: positiveInteger(
            registerPortOverride === undefined ? 'registerPort' : 'NACOS_REGISTER_PORT',
            registerPortOverride ?? options.registerPort,
            65535
        )
    }
}
