export interface RequestLoggingOptions {
    serviceName: string
    ignoredPaths?: string[]
    maxPayloadLength?: number
}

export interface RequestLogPayload {
    service: string
    logId: string
    requestId: string
    method: string
    url: string
    statusCode: number
    durationMs: number
    ip: string
    host: string
    origin: string
    referer: string
    userAgent: string
    query?: unknown
    params?: unknown
    body?: unknown
}
