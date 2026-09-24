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
    assert.equal(response.headers['x-business-code'], '200')
    assert.equal(request.executionMethod, undefined)
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
    assert.equal(response['x-business-code'], '400')
    assert.match(response.body.timestamp, timestampPattern)
})

test('HttpExceptionFilter falls back to the matched route handler when the stack has no application frame', () => {
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
    const originalError = Logger.prototype.error
    let loggedContext
    let loggedMessage
    Logger.prototype.error = (message, _stack, context) => {
        loggedMessage = message
        loggedContext = context
    }

    try {
        filter.catch(exception, createHttpContext(response, defaultHandler, request))
    } finally {
        Logger.prototype.error = originalError
    }

    assert.equal(loggedContext, 'TestController.defaultHandler')
    assert.equal(request.executionMethod, 'TestController.defaultHandler')
    assert.match(loggedMessage, /执行方法:\[TestController\.defaultHandler\]/)
})

test('HttpExceptionFilter logs the public gateway URL', () => {
    const filter = new HttpExceptionFilter()
    const request = {
        method: 'POST',
        originalUrl: '/sheet/update',
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
    const originalError = Logger.prototype.error
    let loggedMessage
    Logger.prototype.error = message => {
        loggedMessage = message
    }

    try {
        filter.catch(new BadRequestException('菜单ID不能为空'), createHttpContext(response, defaultHandler, request))
    } finally {
        Logger.prototype.error = originalError
    }

    assert.match(loggedMessage, /^POST \/api\/account\/sheet\/update -> 400 菜单ID不能为空/)
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
        setHeader(name, value) {
            this[name] = value
        },
        json(body) {
            this.body = body
        }
    }

    filter.catch(new Error('database password leaked'), createHttpContext(response))

    assert.equal(response.statusCode, 200)
    assert.equal(response.body.code, 500)
    assert.equal(response['x-business-code'], '500')
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
        '    at SheetUtilsService.findRequired (F:\\chat-web-service\\chat-web-account-service\\src\\modules\\sheet\\sheet.utils.service.ts:27:19)',
        '    at node:internal/process/task_queues:105:5'
    ].join('\n')

    assert.equal(resolveExceptionExecutionMethod(exception), 'SheetUtilsService.findRequired (sheet.utils.service.ts:27:19)')
})

test('HttpExceptionFilter 校验失败日志包含路由位置、完整入参和用户且不输出 undefined', () => {
    const filter = new HttpExceptionFilter()
    const request = {
        method: 'POST',
        originalUrl: '/user/update',
        headers: { 'x-request-id': 'request-validation', 'x-forwarded-prefix': '/api/account' },
        routeMethod: 'UserController.httpBaseUserUpdate',
        query: {},
        params: {},
        body: { phone: '123', email: 'bad', password: 'secret' },
        user: { uid: '10001', number: 'U001', name: '管理员', sessionId: 'hidden-session' }
    }
    const response = {
        headersSent: false,
        status() {
            return this
        },
        setHeader() {},
        json() {}
    }
    const originalError = Logger.prototype.error
    let loggedArgs
    Logger.prototype.error = (...args) => {
        loggedArgs = args
    }

    try {
        filter.catch(createPipeException(['手机号格式错误', '邮箱格式错误']), {
            switchToHttp: () => ({ getRequest: () => request, getResponse: () => response })
        })
    } finally {
        Logger.prototype.error = originalError
    }

    const [message, stack, context] = loggedArgs
    assert.equal(stack, undefined)
    assert.equal(context, 'UserController.httpBaseUserUpdate')
    assert.match(message, /^POST \/api\/account\/user\/update -> 400 手机号格式错误 执行方法:\[UserController\.httpBaseUserUpdate\]/)
    const details = JSON.parse(message.slice(message.indexOf(' {') + 1))
    assert.deepEqual(details.error.response.message, ['手机号格式错误', '邮箱格式错误'])
    assert.equal(details.error.name, 'BadRequestException')
    assert.deepEqual(details.body, { phone: '123', email: 'bad', password: '[已隐藏]' })
    assert.deepEqual(details.user, { uid: '10001', number: 'U001', name: '管理员' })
    assert.equal('query' in details, false)
})

test('HttpExceptionFilter 没有定位信息时只传入日志消息', () => {
    const filter = new HttpExceptionFilter()
    const request = { method: 'GET', originalUrl: '/users', headers: {} }
    const response = {
        headersSent: false,
        status() {
            return this
        },
        setHeader() {},
        json() {}
    }
    const originalError = Logger.prototype.error
    let loggedArgs
    Logger.prototype.error = (...args) => {
        loggedArgs = args
    }

    try {
        filter.catch(createPipeException('参数错误'), {
            switchToHttp: () => ({ getRequest: () => request, getResponse: () => response })
        })
    } finally {
        Logger.prototype.error = originalError
    }

    assert.equal(loggedArgs.length, 1)
})

test('TransformInterceptor 在管道执行前记录路由方法', async () => {
    const request = { headers: { 'x-request-id': 'request-route-method' } }
    const response = { headersSent: false, getHeader() {}, setHeader() {} }
    const context = {
        getType: () => 'http',
        getClass: () => class UserController {},
        getHandler: function httpBaseUserUpdate() {},
        switchToHttp: () => ({ getRequest: () => request, getResponse: () => response })
    }
    context.getHandler = () => function httpBaseUserUpdate() {}

    await firstValueFrom(new TransformInterceptor().intercept(context, { handle: () => of({}) }))

    assert.equal(request.routeMethod, 'UserController.httpBaseUserUpdate')
})

/** 模拟 ValidationPipe 抛出的异常：调用栈只包含 Nest 运行时帧。 */
function createPipeException(message) {
    const exception = new BadRequestException(message)
    exception.stack = [
        'BadRequestException',
        '    at ValidationPipe.transform (/app/node_modules/@nestjs/common/pipes/validation.pipe.js:1:1)'
    ].join('\n')
    return exception
}

test('DetailedValidationPipe 在异常 cause 中保留原始校验错误且响应不变', async () => {
    const { IsMobilePhone, IsString } = require('class-validator')
    const { DetailedValidationPipe } = require('../dist/src/filters')
    class UpdateUserDto {}
    IsMobilePhone('zh-CN', { strictMode: false }, { message: '手机号格式错误' })(UpdateUserDto.prototype, 'phone')
    IsString({ message: '密码必须是字符串' })(UpdateUserDto.prototype, 'password')

    const pipe = new DetailedValidationPipe({ transform: true, whitelist: true })
    const exception = await pipe.transform({ phone: '123', password: 1 }, { type: 'body', metatype: UpdateUserDto }).then(
        () => undefined,
        error => error
    )

    assert.ok(exception instanceof BadRequestException)
    assert.deepEqual(exception.getResponse().message, ['手机号格式错误', '密码必须是字符串'])
    assert.equal(exception.cause.length, 2)

    const { serializeExceptionForLog } = require('../dist/src/filters')
    const serialized = serializeExceptionForLog(exception)
    assert.equal(serialized.name, 'BadRequestException')
    assert.equal(serialized.status, 400)
    assert.deepEqual(serialized.cause[0], { property: 'phone', value: '123', constraints: { isMobilePhone: '手机号格式错误' } })
    assert.equal(serialized.cause[1].value, '[已隐藏]')
    assert.equal('target' in serialized.cause[0], false)
})

test('serializeExceptionForLog 保留驱动错误属性并处理循环引用', () => {
    const { serializeExceptionForLog } = require('../dist/src/filters')
    const error = new Error('Duplicate entry')
    error.code = 'ER_DUP_ENTRY'
    error.errno = 1062
    error.sql = 'INSERT INTO tb_account_user'
    error.parameters = { password: 'secret' }
    error.self = error

    const serialized = serializeExceptionForLog(error)
    assert.equal(serialized.message, 'Duplicate entry')
    assert.equal(serialized.code, 'ER_DUP_ENTRY')
    assert.equal(serialized.errno, 1062)
    assert.equal(serialized.parameters.password, '[已隐藏]')
    assert.equal(serialized.self, '[循环引用]')
    assert.equal('stack' in serialized, false)
})
