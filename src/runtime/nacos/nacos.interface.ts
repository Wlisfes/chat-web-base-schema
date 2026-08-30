import type { Host } from 'nacos'

/** Nacos 服务实例变更回调。 */
export type NacosInstanceListener = (hosts: Host[]) => void

/** `NacosModule` 内部注入的完整 Nacos 启动、订阅与服务注册配置。 */
export interface NacosRuntimeOptions {
    /** Nacos 配置中心与注册中心地址。运行时必填，通常映射 `.env` 的 `NACOS_SERVER`。 */
    serverAddr: string
    /** Nacos namespace ID。运行时必填，通常映射 `.env` 的 `NACOS_NAMESPACE`。 */
    namespace: string
    /** Nacos 认证用户名；不需要认证时省略。 */
    username?: string
    /** Nacos 认证密码；不需要认证时省略。 */
    password?: string
    /** 配置中心请求超时时间，单位毫秒。默认 `5000`。 */
    requestTimeout?: number
    /** 订阅的配置 Data ID。默认 `${serviceName}.yaml`。 */
    configDataId?: string
    /** 配置订阅组。默认 `DEFAULT_GROUP`。 */
    configGroup?: string
    /** 是否向 Nacos 注册服务实例。默认 `true`。 */
    registerEnabled?: boolean
    /** 是否启用服务发现。默认跟随 `registerEnabled`；未配置注册开关时为 `true`。 */
    discoveryEnabled?: boolean
    /** 服务发现连接失败时是否阻止应用启动。默认 `false`。 */
    discoveryRequired?: boolean
    /** 是否启用配置中心。默认 `true`。 */
    configEnabled?: boolean
    /** 配置中心加载失败时是否阻止应用启动。默认 `true`。 */
    configRequired?: boolean
    /** 注册失败时是否阻止应用启动。默认 `false`。 */
    registerRequired?: boolean
    /** Nacos 服务注册名称，同时用于推导默认 Data ID；通过环境适配器时来自 `NACOS_SERVICE_NAME`。 */
    serviceName: string
    /** 服务发现组。默认使用解析后的 `configGroup`。 */
    discoveryGroup?: string
    /** 注册实例 IP；省略时自动选择首个非内部 IPv4，最终回退到 `127.0.0.1`。 */
    registerIp?: string
    /** 注册实例端口。由调用方的 `registerPort` 或 `NACOS_REGISTER_PORT` 解析，范围 `1-65535`。 */
    registerPort: number
    /** 注册实例权重。取值为大于 0 且不超过 10000 的数值；数值越大，支持加权负载的消费者分配到的请求越多；默认 `1`。 */
    registerWeight?: number
}

/** `NacosRuntimeOptions` 的 NestJS 注入令牌。 */
export const NACOS_RUNTIME_OPTIONS = Symbol('NACOS_RUNTIME_OPTIONS')

/** Nacos 运行时连接与注册状态。 */
export interface NacosRuntimeStatus {
    configEnabled: boolean
    configLoaded: boolean
    discoveryEnabled: boolean
    connected: boolean
    registered: boolean
    configError?: string
    discoveryError?: string
}
