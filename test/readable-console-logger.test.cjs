const test = require('node:test')
const assert = require('node:assert/strict')
const { stripVTControlCharacters } = require('node:util')

const { ReadableConsoleLogger, resolveServiceExecutionMethod } = require('../dist/src/runtime/logging')

function createPayload(overrides = {}) {
    return {
        message: 'HTTP请求完成',
        service: 'chat-web-example-service',
        logId: '34ec4ca9-2abf-49b8-85f6-77d7fd23ea1d',
        method: 'POST',
        url: '/example/list',
        statusCode: 200,
        durationMs: 12,
        executionMethod: 'ExampleService.httpBaseExampleList',
        ip: '127.0.0.1',
        host: 'example.lisfes.com',
        origin: '',
        referer: '',
        userAgent: 'node-test',
        query: {},
        params: {},
        body: { name: '测试' },
        ...overrides
    }
}

function captureLog(options, payload) {
    const lines = []
    const originalWrite = process.stdout.write
    process.stdout.write = value => {
        lines.push(String(value))
        return true
    }

    try {
        const logger = new ReadableConsoleLogger(options)
        logger.log(payload, 'chat-web-example-service:HTTP')
    } finally {
        process.stdout.write = originalWrite
    }

    assert.equal(lines.length, 1)
    return lines[0]
}

function captureWarn(options, message, context) {
    const lines = []
    const originalWrite = process.stdout.write
    process.stdout.write = value => {
        lines.push(String(value))
        return true
    }

    try {
        const logger = new ReadableConsoleLogger(options)
        logger.warn(message, context)
    } finally {
        process.stdout.write = originalWrite
    }

    assert.equal(lines.length, 1)
    return lines[0]
}

test('本地请求日志保留彩色头部和缩进 JSON', () => {
    const line = captureLog({ NODE_ENV: 'development', prefix: 'chat-web-example-service' }, createPayload())
    const plain = stripVTControlCharacters(line)

    assert.match(line, /\u001B\[/)
    assert.match(plain, /服务名称:\[chat-web-example-service\]/)
    assert.match(plain, /执行方法:\[ExampleService\.httpBaseExampleList\]/)
    assert.match(plain, /日志ID:\[34ec4ca9-2abf-49b8-85f6-77d7fd23ea1d\]/)
    assert.ok(plain.trim().split(/\r?\n/).length > 1)
    assert.match(plain, /"message": "HTTP请求完成"/)
    assert.doesNotMatch(plain, /"requestId"/)
    assert.doesNotMatch(plain, /"executionMethod"/)
})

test('请求日志头部显示异常过滤器写入的 Controller 兜底位置', () => {
    const line = captureLog(
        { NODE_ENV: 'development', prefix: 'chat-web-example-service' },
        createPayload({ executionMethod: 'UserController.httpBaseAccountColumnUser' })
    )
    const plain = stripVTControlCharacters(line)

    assert.match(plain, /执行方法:\[UserController\.httpBaseAccountColumnUser\]/)
    assert.doesNotMatch(plain, /"executionMethod"/)
})

test('生产请求日志保留颜色并将 JSON 压缩为单个物理行', () => {
    const line = captureLog({ NODE_ENV: 'production', prefix: 'chat-web-example-service' }, createPayload({ body: undefined }))
    const plain = stripVTControlCharacters(line)

    assert.match(line, /\u001B\[/)
    assert.equal(plain.trim().split(/\r?\n/).length, 1)
    assert.match(plain, /\{"message":"HTTP请求完成","service":"chat-web-example-service","logId":"34ec4ca9/)
    assert.match(plain.trim(), /"body":null\}$/)
    assert.doesNotMatch(plain, /"requestId"/)
})

test('异常日志头部显示实际抛错方法', () => {
    const line = captureWarn(
        { NODE_ENV: 'development', prefix: 'chat-web-example-service' },
        'POST /sheet/update -> 400 菜单ID不能为空',
        'SheetUtilsService.findRequired (sheet.utils.service.ts:27:19)'
    )
    const plain = stripVTControlCharacters(line)

    assert.match(plain, /执行方法:\[SheetUtilsService\.findRequired \(sheet\.utils\.service\.ts:27:19\)\]/)
})

test('日志初始化缺少 NODE_ENV 时直接抛出异常', () => {
    assert.throws(() => new ReadableConsoleLogger({ prefix: 'chat-web-example-service' }), /NODE_ENV/)
    assert.throws(() => new ReadableConsoleLogger({ NODE_ENV: '   ', prefix: 'chat-web-example-service' }), /NODE_ENV/)
})

test('普通日志从 Service 调用栈解析执行方法并忽略 Controller', () => {
    const stack = [
        'Error',
        '    at ReadableConsoleLogger.formatMessage (E:\\chat-web-service\\chat-web-base-schema\\src\\runtime\\logging\\readable-console-logger.ts:120:50)',
        '    at Logger.log (E:\\chat-web-service\\chat-web-base-schema\\node_modules\\@nestjs\\common\\services\\logger.service.js:40:10)',
        '    at CaptchaService.create (E:\\chat-web-service\\chat-web-auth-service\\src\\modules\\auth\\captcha.service.ts:33:21)',
        '    at AuthService.httpBaseAuthWriteCodex (E:\\chat-web-service\\chat-web-auth-service\\src\\modules\\auth\\auth.service.ts:80:10)',
        '    at AuthController.httpBaseAuthWriteCodex (E:\\chat-web-service\\chat-web-auth-service\\src\\modules\\auth\\auth.controller.ts:40:10)'
    ].join('\n')

    assert.equal(resolveServiceExecutionMethod(stack, 'CaptchaService'), 'CaptchaService.create')
    assert.equal(resolveServiceExecutionMethod(stack), 'CaptchaService.create')
})

test('CaptchaService 日志头部显示 CaptchaService.create 而不是类名', () => {
    const lines = []
    const originalWrite = process.stdout.write
    process.stdout.write = value => {
        lines.push(String(value))
        return true
    }

    try {
        const logger = new ReadableConsoleLogger({ NODE_ENV: 'development', prefix: 'chat-web-auth-service' })
        class CaptchaService {
            create() {
                logger.log('图形验证码已写入 Redis：key=test, value=ABCD', CaptchaService.name)
            }
        }
        new CaptchaService().create()
    } finally {
        process.stdout.write = originalWrite
    }

    assert.equal(lines.length, 1)
    const plain = stripVTControlCharacters(lines[0])
    assert.match(plain, /执行方法:\[CaptchaService\.create\]/)
    assert.doesNotMatch(plain, /执行方法:\[CaptchaService\]/)
    assert.doesNotMatch(plain, /AuthController/)
})
