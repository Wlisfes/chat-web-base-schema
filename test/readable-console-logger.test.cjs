const test = require('node:test')
const assert = require('node:assert/strict')
const { stripVTControlCharacters } = require('node:util')

const { ReadableConsoleLogger } = require('../dist/src/runtime/logging')

function createPayload(overrides = {}) {
    return {
        message: 'HTTP请求完成',
        service: 'chat-web-example-service',
        logId: '34ec4ca9-2abf-49b8-85f6-77d7fd23ea1d',
        method: 'POST',
        url: '/example/list',
        statusCode: 200,
        durationMs: 12,
        executionMethod: 'ExampleController.httpBaseExampleList',
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
    assert.match(plain, /执行方法:\[ExampleController\.httpBaseExampleList\]/)
    assert.match(plain, /日志ID:\[34ec4ca9-2abf-49b8-85f6-77d7fd23ea1d\]/)
    assert.ok(plain.trim().split(/\r?\n/).length > 1)
    assert.match(plain, /"message": "HTTP请求完成"/)
    assert.doesNotMatch(plain, /"requestId"/)
    assert.match(plain, /"executionMethod": "ExampleController\.httpBaseExampleList"/)
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
