const assert = require('node:assert/strict')
const test = require('node:test')

const { StructuredLogger } = require('../dist/src/runtime/logging')
const { runWithRequestContext } = require('../dist/src/utils/modules/request-context')

test('结构化日志输出服务、环境和请求上下文', () => {
    const lines = []
    const originalLog = console.log
    console.log = line => lines.push(line)
    try {
        const logger = new StructuredLogger({ serviceName: 'test-service', environment: 'test' })
        runWithRequestContext('request-structured', () => logger.log({ message: '测试日志', count: 1 }, 'TestContext'))
    } finally {
        console.log = originalLog
    }

    assert.equal(lines.length, 1)
    const payload = JSON.parse(lines[0])
    assert.equal(payload.message, '测试日志')
    assert.equal(payload.count, 1)
    assert.equal(payload.level, 'info')
    assert.equal(payload.service, 'test-service')
    assert.equal(payload.environment, 'test')
    assert.equal(payload.context, 'TestContext')
    assert.equal(payload.requestId, 'request-structured')
})
