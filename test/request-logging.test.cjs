const test = require('node:test')
const assert = require('node:assert/strict')
const { Logger } = require('@nestjs/common')

const { DEFAULT_REQUEST_LOGGING_IGNORED_PATHS, createRequestLoggingMiddleware } = require('../dist/src/runtime/logging')

test('请求日志中间件生成请求 ID 并隐藏敏感入参', () => {
    const messages = []
    const originalLog = Logger.prototype.log
    Logger.prototype.log = message => messages.push(message)
    const listeners = new Map()
    const request = {
        headers: { 'user-agent': 'node-test' },
        method: 'POST',
        originalUrl: '/auth/token/login',
        path: '/auth/token/login',
        query: { keyword: 'tester' },
        params: {},
        body: { name: 'tester', password: 'secret', code: 'A7K9' },
        ip: '127.0.0.1',
        socket: {}
    }
    const response = {
        statusCode: 200,
        setHeader(name, value) {
            this[name] = value
        },
        once(name, listener) {
            listeners.set(name, listener)
        }
    }
    let nextCalled = false
    createRequestLoggingMiddleware('test-service')(request, response, () => {
        nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.match(response['x-request-id'], /^[0-9a-f-]{36}$/)
    assert.equal(request.headers['x-request-id'], response['x-request-id'])
    assert.equal(typeof listeners.get('finish'), 'function')
    listeners.get('finish')()
    Logger.prototype.log = originalLog

    assert.equal(messages.length, 1)
    const payload = messages[0]
    assert.equal(payload.message, 'HTTP请求完成')
    assert.equal(payload.logId, response['x-request-id'])
    assert.equal('requestId' in payload, false)
    assert.equal(payload.body.name, 'tester')
    assert.equal(payload.body.password, '[已隐藏]')
    assert.equal(payload.body.code, '[已隐藏]')
    assert.equal(JSON.stringify(messages[0]).includes('secret'), false)
    assert.equal(JSON.stringify(messages[0]).includes('A7K9'), false)
})

test('请求日志中间件默认忽略健康检查、浏览器探测和接口文档路径', () => {
    const messages = []
    const originalLog = Logger.prototype.log
    Logger.prototype.log = message => messages.push(message)

    try {
        const paths = [...DEFAULT_REQUEST_LOGGING_IGNORED_PATHS, '/api/swagger/swagger-ui.css']
        for (const path of paths) {
            let finish
            const request = {
                headers: {},
                method: 'GET',
                originalUrl: path,
                path,
                query: {},
                params: {},
                ip: '127.0.0.1',
                socket: {}
            }
            const response = {
                statusCode: 200,
                setHeader() {},
                once(_name, listener) {
                    finish = listener
                }
            }

            createRequestLoggingMiddleware('test-service')(request, response, () => undefined)
            finish()
        }
    } finally {
        Logger.prototype.log = originalLog
    }

    assert.equal(messages.length, 0)
})
