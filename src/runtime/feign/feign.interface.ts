export type FeignFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

export type FeignClientConstructor<TClient extends object = object> = new () => TClient

export type FeignHttpMethod = 'GET' | 'POST'

export interface FeignClientOptions {
    name: string
    baseUrlConfigKey: string
    defaultBaseUrl: string
    timeoutConfigKey?: string
    defaultTimeoutMs?: number
}

export interface FeignMethodOptions {
    method: FeignHttpMethod
    path: string
}

export type FeignParameterKind = 'body' | 'header' | 'query'

export interface FeignParameterOptions {
    index: number
    kind: FeignParameterKind
    name?: string
}

export interface FeignMethodDefinition extends FeignMethodOptions {
    parameters: FeignParameterOptions[]
}

export interface FeignApiEnvelope {
    code?: unknown
    data?: unknown
    message?: unknown
}
