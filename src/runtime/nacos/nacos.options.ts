import { NacosRuntimeOptions } from './nacos.interface'

/**
 * 从环境变量构造完整 Nacos 运行参数时所需的服务固有默认值。
 */
export type NacosRuntimeDefaults = Pick<NacosRuntimeOptions, 'serviceName' | 'registerPort'>

/**
 * 业务服务必须显式传入的 Nacos 环境变量映射。
 *
 * 所有属性均要求出现在调用处，值仍可为 `undefined`，以便从代码中直接看出
 * `.env` 支持的完整字段；实际必填项只有 `NACOS_SERVER` 和 `NACOS_NAMESPACE`。
 */
export interface NacosRuntimeEnvironment {
    /** Nacos 配置中心与注册中心地址。必填。 */
    NACOS_SERVER: string | undefined
    /** Nacos namespace ID。必填。 */
    NACOS_NAMESPACE: string | undefined
    /** Nacos 认证用户名；未开启认证时不配置。 */
    NACOS_USERNAME: string | undefined
    /** Nacos 认证密码；未开启认证时不配置。 */
    NACOS_PASSWORD: string | undefined
    /** 配置中心请求超时时间，单位毫秒；默认 `5000`。 */
    NACOS_REQUEST_TIMEOUT: string | undefined
    /** 配置 Data ID；默认 `${serviceName}.yaml`。 */
    NACOS_CONFIG_DATA_ID: string | undefined
    /** 配置订阅组；默认 `DEFAULT_GROUP`。 */
    NACOS_CONFIG_GROUP: string | undefined
    /** 是否注册服务实例，只接受 `true` 或 `false`；默认 `true`。 */
    NACOS_REGISTER_ENABLED: string | undefined
    /** 注册失败是否阻止应用启动，只接受 `true` 或 `false`；默认 `false`。 */
    NACOS_REGISTER_REQUIRED: string | undefined
    /** Nacos 服务名称；默认使用调用方提供的服务固有名称。 */
    NACOS_SERVICE_NAME: string | undefined
    /** 服务发现组；默认使用配置订阅组。 */
    NACOS_GROUP: string | undefined
    /** 注册实例 IP；默认自动选择非内部 IPv4。 */
    NACOS_REGISTER_IP: string | undefined
    /** 注册实例端口；未配置时依次使用 `PORT` 和服务固有端口。 */
    NACOS_REGISTER_PORT: string | undefined
    /** 应用监听端口，同时作为注册端口的后备值。 */
    PORT: string | undefined
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

function positiveInteger(name: string, value: string | undefined, fallback?: number, maximum = Number.MAX_SAFE_INTEGER): number {
    const normalized = optionalString(value)
    if (normalized === undefined && fallback !== undefined) return fallback
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
 * 服务名与注册端口使用调用方传入的服务固有默认值；其余空值保持 `undefined`，
 * 由 `NacosService` 统一应用接口文档中声明的默认值。
 */
export function createNacosRuntimeOptions(defaults: NacosRuntimeDefaults, environment: NacosRuntimeEnvironment): NacosRuntimeOptions {
    return {
        serverAddr: requiredString('NACOS_SERVER', environment.NACOS_SERVER),
        namespace: requiredString('NACOS_NAMESPACE', environment.NACOS_NAMESPACE),
        username: optionalString(environment.NACOS_USERNAME),
        password: optionalString(environment.NACOS_PASSWORD),
        requestTimeout: optionalPositiveInteger('NACOS_REQUEST_TIMEOUT', environment.NACOS_REQUEST_TIMEOUT),
        configDataId: optionalString(environment.NACOS_CONFIG_DATA_ID),
        configGroup: optionalString(environment.NACOS_CONFIG_GROUP),
        registerEnabled: optionalBoolean('NACOS_REGISTER_ENABLED', environment.NACOS_REGISTER_ENABLED),
        registerRequired: optionalBoolean('NACOS_REGISTER_REQUIRED', environment.NACOS_REGISTER_REQUIRED),
        serviceName: optionalString(environment.NACOS_SERVICE_NAME) ?? defaults.serviceName,
        discoveryGroup: optionalString(environment.NACOS_GROUP),
        registerIp: optionalString(environment.NACOS_REGISTER_IP),
        registerPort: positiveInteger(
            'NACOS_REGISTER_PORT',
            optionalString(environment.NACOS_REGISTER_PORT) ?? optionalString(environment.PORT),
            defaults.registerPort,
            65535
        )
    }
}
