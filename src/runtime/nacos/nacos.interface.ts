export interface NacosRuntimeOptions {
    serverAddr: string
    namespace: string
    username?: string
    password?: string
    requestTimeout: number
    configDataId: string
    configGroup: string
    registerEnabled: boolean
    registerRequired: boolean
    serviceName: string
    discoveryGroup: string
    registerIp?: string
    registerPort: number
}

export const NACOS_RUNTIME_OPTIONS = Symbol('NACOS_RUNTIME_OPTIONS')
