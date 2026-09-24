const test = require('node:test')
const assert = require('node:assert/strict')
const { Logger } = require('@nestjs/common')
const { EventEmitter } = require('node:events')

const {
    DEFAULT_REQUEST_LOGGING_IGNORED_PATHS,
    createRequestLoggingMiddleware,
    parseJsonBusinessCode,
    resolveBusinessStatusCode
} = require('../dist/src/runtime/logging')

test('请求日志中间件生成请求 ID 并隐藏敏感入参', () => {
    const messages = []
    const originalLog = Logger.prototype.log
    Logger.prototype.log = message => messages.push(message)
    const listeners = new Map()
    const request = {
        headers: { 'user-agent': 'node-test', 'x-forwarded-prefix': '/api/account' },
        method: 'POST',
        originalUrl: '/auth/token/login?source=manager',
        path: '/auth/token/login',
        query: { keyword: 'tester' },
        params: {},
        body: { name: 'tester', password: 'secret', code: 'A7K9' },
        executionMethod: 'AuthService.httpBaseAccountLoginAuth',
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
    assert.equal(payload.executionMethod, 'AuthService.httpBaseAccountLoginAuth')
    assert.equal(payload.url, '/api/account/auth/token/login?source=manager')
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

test('请求日志中间件保留异常过滤器写入的路由定位', () => {
    const messages = []
    const originalLog = Logger.prototype.log
    Logger.prototype.log = message => messages.push(message)
    let finish
    const request = {
        headers: {},
        method: 'GET',
        originalUrl: '/auth/codex/write',
        path: '/auth/codex/write',
        query: {},
        params: {},
        body: {},
        executionMethod: 'AuthController.httpBaseAuthWriteCodex',
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

    try {
        createRequestLoggingMiddleware('test-service')(request, response, () => undefined)
        finish()
    } finally {
        Logger.prototype.log = originalLog
    }

    assert.equal(messages[0].executionMethod, 'AuthController.httpBaseAuthWriteCodex')
})

test('parseJsonBusinessCode 支持截断的 JSON 片段', () => {
    assert.equal(parseJsonBusinessCode('{"data":null,"code":500,"message":"服务器'), 500)
    assert.equal(parseJsonBusinessCode('{"data":null,"code":200,"message":"success"}'), 200)
})

test('请求日志中间件将非 200 业务码记为错误', () => {
    const logs = []
    const errors = []
    const originalLog = Logger.prototype.log
    const originalError = Logger.prototype.error
    Logger.prototype.log = message => logs.push(message)
    Logger.prototype.error = message => errors.push(message)

    try {
        let finish
        const headers = {}
        const request = {
            headers: {},
            method: 'POST',
            originalUrl: '/auth/token/login',
            path: '/auth/token/login',
            query: {},
            params: {},
            body: {},
            ip: '127.0.0.1',
            socket: {}
        }
        const response = {
            statusCode: 200,
            setHeader(name, value) {
                headers[name] = value
            },
            getHeader(name) {
                return headers[name]
            },
            once(_name, listener) {
                finish = listener
            }
        }

        createRequestLoggingMiddleware('test-service')(request, response, () => undefined)
        response.setHeader('x-business-code', '500')
        finish()

        assert.equal(logs.length, 0)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].message, 'HTTP请求完成')
        assert.equal(errors[0].statusCode, 500)
        assert.equal(resolveBusinessStatusCode(response), 500)
    } finally {
        Logger.prototype.log = originalLog
        Logger.prototype.error = originalError
    }
})

test('请求日志中间件从响应体读取业务码', () => {
    const errors = []
    const originalError = Logger.prototype.error
    Logger.prototype.error = message => errors.push(message)

    try {
        let finish
        const request = {
            headers: {},
            method: 'POST',
            originalUrl: '/auth/token/login',
            path: '/auth/token/login',
            query: {},
            params: {},
            body: {},
            ip: '127.0.0.1',
            socket: {}
        }
        const response = {
            statusCode: 200,
            setHeader() {},
            getHeader() {},
            write() {
                return true
            },
            end() {
                return this
            },
            once(_name, listener) {
                finish = listener
            }
        }

        createRequestLoggingMiddleware('test-service')(request, response, () => undefined)
        response.end('{"data":null,"code":400,"message":"名称不能为空"}')
        finish()

        assert.equal(errors.length, 1)
        assert.equal(errors[0].statusCode, 400)
    } finally {
        Logger.prototype.error = originalError
    }
})

test('请求日志中间件在未解析 body 的流式转发场景下旁路捕获并脱敏入参', () => {
    const messages = []
    const originalError = Logger.prototype.error
    Logger.prototype.error = message => messages.push(message)
    const request = Object.assign(new EventEmitter(), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
        method: 'POST',
        originalUrl: '/api/account/user/update',
        path: '/api/account/user/update',
        query: {},
        params: {},
        ip: '127.0.0.1',
        socket: {}
    })
    let finish
    const response = {
        statusCode: 200,
        setHeader() {},
        getHeader: () => '400',
        once(_name, listener) {
            finish = listener
        }
    }
    const received = []
    request.on('data', chunk => received.push(chunk))

    try {
        createRequestLoggingMiddleware('test-service')(request, response, () => undefined)
        request.emit('data', Buffer.from('{"phone":"123",'))
        request.emit('data', Buffer.from('"password":"secret"}'))
        finish()
    } finally {
        Logger.prototype.error = originalError
    }

    assert.equal(Buffer.concat(received).toString(), '{"phone":"123","password":"secret"}')
    assert.deepEqual(messages[0].body, { phone: '123', password: '[已隐藏]' })
})

test('请求日志中间件截断超长原始入参时仍隐藏敏感字段', () => {
    const messages = []
    const originalLog = Logger.prototype.log
    Logger.prototype.log = message => messages.push(message)
    const request = Object.assign(new EventEmitter(), {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        originalUrl: '/upload',
        path: '/upload',
        query: {},
        params: {},
        ip: '127.0.0.1',
        socket: {}
    })
    let finish
    const response = { statusCode: 200, setHeader() {}, once: (_name, listener) => (finish = listener) }

    try {
        createRequestLoggingMiddleware('test-service')(request, response, () => undefined)
        request.emit('data', Buffer.from(`{"password":"secret","content":"${'x'.repeat(5000)}"}`))
        finish()
    } finally {
        Logger.prototype.log = originalLog
    }

    assert.match(messages[0].body, /^\{"password":"\[已隐藏\]","content":"x+\.\.\.\[已截断\]$/)
    assert.equal(messages[0].body.includes('secret'), false)
})
