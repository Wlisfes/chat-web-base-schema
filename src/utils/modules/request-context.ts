import { randomUUID } from 'node:crypto'
import { AsyncLocalStorage } from 'node:async_hooks'
import type { RequestHandler } from 'express'

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/
const requestStorage = new AsyncLocalStorage<{ requestId: string }>()

export const requestContextMiddleware: RequestHandler = (request, response, next) => {
    const requestId = resolveRequestId(request.header('x-request-id'))

    request.headers['x-request-id'] = requestId
    response.setHeader('x-request-id', requestId)
    requestStorage.run({ requestId }, next)
}

export function getActiveRequestId(): string | undefined {
    return requestStorage.getStore()?.requestId
}

export function runWithRequestContext<T>(requestId: string, callback: () => T): T {
    return requestStorage.run({ requestId: resolveRequestId(requestId) }, callback)
}

export function resolveRequestId(value: unknown): string {
    const candidate = Array.isArray(value) ? value[0] : value
    return typeof candidate === 'string' && REQUEST_ID_PATTERN.test(candidate) ? candidate : randomUUID()
}
