import { NacosRuntimeOptions } from './nacos.interface'

/**
 * `NacosModule.forRoot()` 从环境变量构造完整运行参数时所需的服务固有值。
 * 业务服务只需传入这两项，不需要重复定义环境变量转换方法。
 */
export type NacosRuntimeDefaults = Pick<NacosRuntimeOptions, 'serviceName' | 'registerPort'>

/** 可注入的环境变量集合；默认使用当前进程的 `process.env`。 */
export type NacosRuntimeEnvironment = Record<string, string | undefined>

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
 * 将扁平化的 `NACOS_*` 环境变量转换为类型完整的 `NacosRuntimeOptions`。
 *
 * `NACOS_SERVER` 和 `NACOS_NAMESPACE` 没有安全的跨环境默认值，因此必须提供。
 * 服务名与注册端口使用调用方传入的服务固有默认值；其余空值保持 `undefined`，
 * 由 `NacosModule` 统一应用接口文档中声明的默认值。
 */
export function createNacosRuntimeOptions(
    defaults: NacosRuntimeDefaults,
    environment: NacosRuntimeEnvironment = process.env
): NacosRuntimeOptions {
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
