import { NacosRuntimeOptions } from './nacos.interface'

/** `forRootNacosRuntimeOptions()` 接收的 Nacos 启动环境变量。 */
export interface NacosRuntimeEnvironment {
    /** 当前服务监听端口，同时作为唯一的注册端口。 */
    PORT?: string
    /** Nacos 配置中心与注册中心地址。必填。 */
    NACOS_SERVER?: string
    /** Nacos namespace ID。必填。 */
    NACOS_NAMESPACE?: string
    /** Nacos 认证用户名；未开启认证时不配置。 */
    NACOS_USERNAME?: string
    /** Nacos 认证密码；未开启认证时不配置。 */
    NACOS_PASSWORD?: string
    /** 配置 Data ID；默认 `${serviceName}.yaml`。 */
    NACOS_CONFIG_DATA_ID?: string
    /** 配置订阅组；默认 `DEFAULT_GROUP`。 */
    NACOS_CONFIG_GROUP?: string
    /** Nacos 服务名称，同时用于推导默认 Data ID。必填。 */
    NACOS_SERVICE_NAME?: string
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

function positiveInteger(name: string, value: string | number | undefined, maximum = Number.MAX_SAFE_INTEGER): number {
    const normalized = typeof value === 'string' ? optionalString(value) : value
    const parsed = Number(normalized)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
        throw new Error(`${name} 必须是 1-${maximum} 之间的整数`)
    }
    return parsed
}

/**
 * 将调用方显式传入的扁平化环境变量转换为类型完整的 `NacosRuntimeOptions`。
 *
 * `PORT`、`NACOS_SERVER`、`NACOS_SERVICE_NAME` 和 `NACOS_NAMESPACE` 必须提供。
 * 其余 Nacos 客户端选项使用固定的运行时策略，不读取业务环境变量。
 */
export function forRootNacosRuntimeOptions(environment: NacosRuntimeEnvironment = process.env): NacosRuntimeOptions {
    const serviceName = requiredString('NACOS_SERVICE_NAME', environment.NACOS_SERVICE_NAME)

    return {
        serverAddr: requiredString('NACOS_SERVER', environment.NACOS_SERVER),
        namespace: requiredString('NACOS_NAMESPACE', environment.NACOS_NAMESPACE),
        username: optionalString(environment.NACOS_USERNAME),
        password: optionalString(environment.NACOS_PASSWORD),
        configDataId: optionalString(environment.NACOS_CONFIG_DATA_ID),
        configGroup: optionalString(environment.NACOS_CONFIG_GROUP),
        serviceName,
        registerPort: positiveInteger('PORT', environment.PORT, 65535)
    }
}
