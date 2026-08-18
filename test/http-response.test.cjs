const test = require('node:test')
const assert = require('node:assert/strict')
const { BadRequestException } = require('@nestjs/common')
const { firstValueFrom, of } = require('rxjs')
const { createApiResponse, isApiResponse } = require('../dist/src/utils/modules/response')
const { TransformInterceptor } = require('../dist/src/interceptor/modules/transform.interceptor')
const { HttpExceptionFilter } = require('../dist/src/filters/modules/http-exception.filter')
const { PreserveHttpStatus } = require('../dist/src/filters/modules/preserve-http-status.decorator')
const publicApi = require('../dist')
const responseApi = require('@wlisfes/chat-web-base-schema/response')

const timestampPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

function createHttpContext(response, handler = () => undefined) {
    return {
        getType: () => 'http',
        getHandler: () => handler,
        getClass: () => class TestController {},
        switchToHttp: () => ({
            getResponse: () => response,
            getRequest: () => ({ method: 'POST', originalUrl: '/users', headers: {} })
        })
    }
}

test('createApiResponse preserves falsy business values', () => {
    for (const value of [false, 0, '']) {
        const result = createApiResponse(value)
        assert.equal(result.data, value)
        assert.equal(result.code, 200)
        assert.equal(result.message, 'success')
        assert.match(result.timestamp, timestampPattern)
    }
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
    const response = { headersSent: false, getHeader: () => undefined }
    const result = await firstValueFrom(interceptor.intercept(createHttpContext(response), { handle: () => of({ id: 1 }) }))

    assert.deepEqual(result.data, { id: 1 })
    assert.equal(result.code, 200)
    assert.equal(isApiResponse(result), true)

    const repeated = await firstValueFrom(interceptor.intercept(createHttpContext(response), { handle: () => of(result) }))
    assert.equal(repeated, result)
})

test('TransformInterceptor leaves explicit content responses untouched', async () => {
    const interceptor = new TransformInterceptor()
    const response = { headersSent: false, getHeader: () => 'image/svg+xml' }
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
        json(body) {
            this.body = body
        }
    }

    filter.catch(new BadRequestException(['名称不能为空']), createHttpContext(response))

    assert.equal(response.statusCode, 200)
    assert.deepEqual(Object.keys(response.body), ['data', 'code', 'message', 'timestamp'])
    assert.equal(response.body.data, null)
    assert.equal(response.body.code, 400)
    assert.equal(response.body.message, '名称不能为空')
    assert.match(response.body.timestamp, timestampPattern)
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
