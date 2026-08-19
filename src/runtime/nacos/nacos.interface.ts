export interface NacosRuntimeOptions {
    serviceName: string
    defaultPort: number
}

export const NACOS_RUNTIME_OPTIONS = Symbol('NACOS_RUNTIME_OPTIONS')
