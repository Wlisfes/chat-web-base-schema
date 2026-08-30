import { NacosRuntimeOptions } from './nacos.interface'

/** `forRootNacosRuntimeOptions()` 接收的扁平环境变量。 */
export interface NacosRuntimeEnvironment {
    /** 当前服务监听端口，同时作为默认注册端口。 */
    PORT?: string
    /** Nacos 配置中心与注册中心地址。必填。 */
    NACOS_SERVER?: string
    /** Nacos namespace ID。必填。 */
    NACOS_NAMESPACE?: string
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
    /** 是否启用服务发现；默认跟随 `NACOS_REGISTER_ENABLED`，未配置注册开关时为 `true`。 */
    NACOS_DISCOVERY_ENABLED?: string
    /** 服务发现连接失败是否阻止启动；默认 `false`。 */
    NACOS_DISCOVERY_REQUIRED?: string
    /** 是否启用配置中心；默认 `true`。 */
    NACOS_CONFIG_ENABLED?: string
    /** 配置中心加载失败是否阻止启动；默认 `true`。 */
    NACOS_CONFIG_REQUIRED?: string
    /** 注册失败是否阻止应用启动，只接受 `true` 或 `false`；默认 `false`。 */
    NACOS_REGISTER_REQUIRED?: string
    /** Nacos 服务名称，同时用于推导默认 Data ID。必填。 */
    NACOS_SERVICE_NAME?: string
    /** 服务发现组；默认使用配置订阅组。 */
    NACOS_GROUP?: string
    /** 注册实例 IP；默认自动选择非内部 IPv4。 */
    NACOS_REGISTER_IP?: string
    /** 注册实例端口；未配置时使用 `PORT`。 */
    NACOS_REGISTER_PORT?: string
    /** 注册实例权重；未配置时使用 `1`，支持大于 0 且不超过 10000 的数值。 */
    NACOS_REGISTER_WEIGHT?: string
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

function optionalPositiveNumber(name: string, value: string | undefined): number | undefined {
    const normalized = optionalString(value)
    if (normalized === undefined) return undefined
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 10_000) {
        throw new Error(`${name} 必须是大于 0 且不超过 10000 的有限数值`)
    }
    return parsed
}

/**
 * 将调用方显式传入的扁平化环境变量转换为类型完整的 `NacosRuntimeOptions`。
 *
 * `PORT`、`NACOS_SERVER`、`NACOS_SERVICE_NAME` 和 `NACOS_NAMESPACE` 必须提供。
 * 其余空值保持 `undefined`，由 `NacosService` 统一应用接口文档中声明的默认值。
 */
export function forRootNacosRuntimeOptions(environment: NacosRuntimeEnvironment = process.env): NacosRuntimeOptions {
    const serviceName = requiredString('NACOS_SERVICE_NAME', environment.NACOS_SERVICE_NAME)
    const registerPortOverride = optionalString(environment.NACOS_REGISTER_PORT)

    return {
        serverAddr: requiredString('NACOS_SERVER', environment.NACOS_SERVER),
        namespace: requiredString('NACOS_NAMESPACE', environment.NACOS_NAMESPACE),
        username: optionalString(environment.NACOS_USERNAME),
        password: optionalString(environment.NACOS_PASSWORD),
        requestTimeout: optionalPositiveInteger('NACOS_REQUEST_TIMEOUT', environment.NACOS_REQUEST_TIMEOUT),
        configDataId: optionalString(environment.NACOS_CONFIG_DATA_ID),
        configGroup: optionalString(environment.NACOS_CONFIG_GROUP),
        registerEnabled: optionalBoolean('NACOS_REGISTER_ENABLED', environment.NACOS_REGISTER_ENABLED),
        discoveryEnabled: optionalBoolean('NACOS_DISCOVERY_ENABLED', environment.NACOS_DISCOVERY_ENABLED),
        discoveryRequired: optionalBoolean('NACOS_DISCOVERY_REQUIRED', environment.NACOS_DISCOVERY_REQUIRED),
        configEnabled: optionalBoolean('NACOS_CONFIG_ENABLED', environment.NACOS_CONFIG_ENABLED),
        configRequired: optionalBoolean('NACOS_CONFIG_REQUIRED', environment.NACOS_CONFIG_REQUIRED),
        registerRequired: optionalBoolean('NACOS_REGISTER_REQUIRED', environment.NACOS_REGISTER_REQUIRED),
        serviceName,
        discoveryGroup: optionalString(environment.NACOS_GROUP),
        registerIp: optionalString(environment.NACOS_REGISTER_IP),
        registerPort: positiveInteger(
            registerPortOverride === undefined ? 'PORT' : 'NACOS_REGISTER_PORT',
            registerPortOverride ?? environment.PORT,
            65535
        ),
        registerWeight: optionalPositiveNumber('NACOS_REGISTER_WEIGHT', environment.NACOS_REGISTER_WEIGHT)
    }
}
