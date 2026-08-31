const test = require('node:test')
const assert = require('node:assert/strict')
const { BadRequestException, Logger } = require('@nestjs/common')
const { firstValueFrom, of } = require('rxjs')
const { createApiResponse, isApiResponse } = require('../dist/src/utils/modules/response')
const { runWithRequestContext } = require('../dist/src/utils/modules/request-context')
const { TransformInterceptor } = require('../dist/src/interceptor/modules/transform.interceptor')
const { HttpExceptionFilter } = require('../dist/src/filters/modules/http-exception.filter')
const { RpcExceptionFilter } = require('../dist/src/filters/modules/rpc-exception.filter')
const { resolveExceptionExecutionMethod } = require('../dist/src/filters/modules/exception-response')
const { PreserveHttpStatus, PreserveHttpStatusInterceptor } = require('../dist/src/filters/modules/preserve-http-status.decorator')
const publicApi = require('../dist')
const responseApi = require('@wlisfes/chat-web-base-schema/response')

const timestampPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

function defaultHandler() {}

function createHttpContext(
    response,
    handler = defaultHandler,
    request = { method: 'POST', originalUrl: '/users', headers: { 'x-request-id': 'request-http-response' } }
) {
    return {
        getType: () => 'http',
        getHandler: () => handler,
        getClass: () => class TestController {},
        switchToHttp: () => ({
            getResponse: () => response,
            getRequest: () => request
        })
    }
}

test('createApiResponse preserves falsy business values', () => {
    for (const value of [false, 0, '']) {
        const result = createApiResponse(value)
        assert.equal(result.data, value)
        assert.equal(result.code, 200)
        assert.equal(result.message, 'success')
        assert.match(result.logId, /^[0-9a-f-]{36}$/)
        assert.match(result.timestamp, timestampPattern)
    }
})

test('createApiResponse reuses the active request ID', () => {
    const result = runWithRequestContext('request-context-response', () => createApiResponse(null))
    assert.equal(result.logId, 'request-context-response')
})

test('public package entry exports shared HTTP infrastructure', () => {
    assert.equal(typeof publicApi.HttpResponseModule, 'function')
    assert.equal(typeof publicApi.TransformInterceptor, 'function')
    assert.equal(typeof publicApi.HttpExceptionFilter, 'function')
    assert.equal(typeof publicApi.RpcExceptionFilter, 'function')
    assert.equal(typeof responseApi.createApiResponse, 'function')
})

test('createApiResponse uses a string business message', () => {
    assert.equal(createApiResponse({ message: '保存成功' }).message, '保存成功')
    assert.equal(createApiResponse({ message: { text: '不应透传' } }).message, 'success')
})

test('TransformInterceptor wraps HTTP data once', async () => {
    const interceptor = new TransformInterceptor()
    const response = {
        headersSent: false,
        headers: {},
        getHeader: () => undefined,
        setHeader(name, value) {
            this.headers[name] = value
        }
    }
    const request = { method: 'POST', originalUrl: '/users', headers: { 'x-request-id': 'request-transform' } }
    const context = createHttpContext(response, defaultHandler, request)
    const result = await firstValueFrom(interceptor.intercept(context, { handle: () => of({ id: 1 }) }))

    assert.deepEqual(result.data, { id: 1 })
    assert.equal(result.code, 200)
    assert.equal(result.logId, 'request-transform')
    assert.equal(response.headers['x-request-id'], 'request-transform')
    assert.equal(request.executionMethod, 'TestController.defaultHandler')
    assert.equal(isApiResponse(result), true)

    const repeated = await firstValueFrom(interceptor.intercept(context, { handle: () => of(result) }))
    assert.equal(repeated, result)
})

test('TransformInterceptor leaves explicit content responses untouched', async () => {
    const interceptor = new TransformInterceptor()
    const response = { headersSent: false, getHeader: () => 'image/svg+xml', setHeader() {} }
    const svg = '<svg></svg>'
    const result = await firstValueFrom(interceptor.intercept(createHttpContext(response), { handle: () => of(svg) }))
    assert.equal(result, svg)
})

test('HttpExceptionFilter returns HTTP 200 and keeps the business error code', () => {
    const filter = new HttpExceptionFilter()
    const response = {
        headersSent: false,
        statusCode: undefined,
        body: undefined,
        status(code) {
            this.statusCode = code
            return this
        },
        setHeader(name, value) {
            this[name] = value
        },
        json(body) {
            this.body = body
        }
    }

    filter.catch(new BadRequestException(['名称不能为空']), createHttpContext(response))

    assert.equal(response.statusCode, 200)
    assert.deepEqual(Object.keys(response.body), ['data', 'code', 'message', 'logId', 'timestamp'])
    assert.equal(response.body.data, null)
    assert.equal(response.body.code, 400)
    assert.equal(response.body.message, '名称不能为空')
    assert.equal(response.body.logId, 'request-http-response')
    assert.equal(response['x-request-id'], response.body.logId)
    assert.match(response.body.timestamp, timestampPattern)
})

test('HttpExceptionFilter falls back to the controller handler when the stack has no application frame', () => {
    const filter = new HttpExceptionFilter()
    const response = {
        headersSent: false,
        statusCode: undefined,
        status(code) {
            this.statusCode = code
            return this
        },
        setHeader() {},
        json() {}
    }
    const exception = new BadRequestException('参数错误')
    exception.stack = ['BadRequestException: 参数错误', '    at node:internal/process/task_queues:105:5'].join('\n')
    const request = { method: 'POST', originalUrl: '/users', headers: { 'x-request-id': 'request-route-fallback' } }
    const originalWarn = Logger.prototype.warn
    let loggedContext
    Logger.prototype.warn = (_message, context) => {
        loggedContext = context
    }

    try {
        filter.catch(exception, createHttpContext(response, defaultHandler, request))
    } finally {
        Logger.prototype.warn = originalWarn
    }

    assert.equal(loggedContext, 'TestController.defaultHandler')
    assert.equal(request.executionMethod, 'TestController.defaultHandler')
})

test('HttpExceptionFilter logs the public gateway URL', () => {
    const filter = new HttpExceptionFilter()
    const request = {
        method: 'POST',
        originalUrl: '/menu/update',
        headers: { 'x-request-id': 'request-public-url', 'x-forwarded-prefix': '/api/account' }
    }
    const response = {
        headersSent: false,
        status(code) {
            this.statusCode = code
            return this
        },
        setHeader() {},
        json() {}
    }
    const originalWarn = Logger.prototype.warn
    let loggedMessage
    Logger.prototype.warn = message => {
        loggedMessage = message
    }

    try {
        filter.catch(new BadRequestException('菜单ID不能为空'), createHttpContext(response, defaultHandler, request))
    } finally {
        Logger.prototype.warn = originalWarn
    }

    assert.match(loggedMessage, /^POST \/api\/account\/menu\/update -> 400 菜单ID不能为空/)
})

test('HttpExceptionFilter hides unhandled server error details', () => {
    const filter = new HttpExceptionFilter()
    const response = {
        headersSent: false,
        statusCode: undefined,
        body: undefined,
        status(code) {
            this.statusCode = code
            return this
        },
        setHeader() {},
        json(body) {
            this.body = body
        }
    }

    filter.catch(new Error('database password leaked'), createHttpContext(response))

    assert.equal(response.statusCode, 200)
    assert.equal(response.body.code, 500)
    assert.equal(response.body.message, '服务器内部错误')
    assert.equal(JSON.stringify(response.body).includes('database password leaked'), false)
})

test('HttpExceptionFilter preserves transport status for explicitly marked protocol endpoints', () => {
    const filter = new HttpExceptionFilter()
    const response = {
        headersSent: false,
        statusCode: undefined,
        body: undefined,
        status(code) {
            this.statusCode = code
            return this
        },
        setHeader() {},
        json(body) {
            this.body = body
        }
    }
    const healthHandler = () => undefined
    PreserveHttpStatus()(healthHandler)

    filter.catch(new BadRequestException('健康检查失败'), createHttpContext(response, healthHandler))

    assert.equal(response.statusCode, 400)
    assert.equal(response.body.code, 400)
})

test('PreserveHttpStatus works with the real ArgumentsHost shape', () => {
    const filter = new HttpExceptionFilter()
    const request = { method: 'GET', originalUrl: '/health', headers: {} }
    const response = {
        headersSent: false,
        statusCode: undefined,
        status(code) {
            this.statusCode = code
            return this
        },
        setHeader() {},
        json() {}
    }
    const host = {
        switchToHttp: () => ({ getRequest: () => request, getResponse: () => response })
    }
    const executionContext = {
        switchToHttp: () => ({ getRequest: () => request })
    }

    new PreserveHttpStatusInterceptor().intercept(executionContext, { handle: () => of(undefined) })
    filter.catch(new BadRequestException('健康检查失败'), host)

    assert.equal(response.statusCode, 400)
})

test('RpcExceptionFilter returns the incoming logId', async () => {
    const filter = new RpcExceptionFilter()
    const host = {
        switchToRpc: () => ({ getData: () => ({ request: { logId: 'request-rpc-error' } }) })
    }

    await assert.rejects(firstValueFrom(filter.catch(new BadRequestException('RPC 参数错误'), host)), error => {
        assert.equal(error.code, 400)
        assert.equal(error.message, 'RPC 参数错误')
        assert.equal(error.logId, 'request-rpc-error')
        return true
    })
})

test('resolveExceptionExecutionMethod locates the application throw site', () => {
    const exception = new BadRequestException('菜单ID不能为空')
    exception.stack = [
        'BadRequestException: 菜单ID不能为空',
        '    at MenuUtilsService.findRequired (F:\\chat-web-service\\chat-web-account-service\\src\\modules\\menu\\menu.utils.service.ts:27:19)',
        '    at node:internal/process/task_queues:105:5'
    ].join('\n')

    assert.equal(resolveExceptionExecutionMethod(exception), 'MenuUtilsService.findRequired (menu.utils.service.ts:27:19)')
})
