export interface RequestLogPayload {
    message: string
    service: string
    logId: string
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
    traceId?: string
    spanId?: string
}

export interface StructuredLoggerOptions {
    serviceName: string
    environment?: string
}

export interface ReadableConsoleLoggerOptions {
    NODE_ENV?: string
    prefix?: string
}
