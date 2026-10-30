const test = require('node:test')
const assert = require('node:assert/strict')
const { resolveSmsEncoding, resolveSmsSegments } = require('../dist/src/utils')

test('纯 GSM7 字符判断为 GSM7，中文和 emoji 判断为 UCS2', () => {
    assert.equal(resolveSmsEncoding('Hello 123'), 'GSM7')
    assert.equal(resolveSmsEncoding('{}^\\€'), 'GSM7')
    assert.equal(resolveSmsEncoding('你好'), 'UCS2')
    assert.equal(resolveSmsEncoding('Hello 😊'), 'UCS2')
})

test('计费条数按编码分段，空内容和单条边界都算 1 条', () => {
    assert.equal(resolveSmsSegments(0, 'GSM7'), 1)
    assert.equal(resolveSmsSegments(160, 'GSM7'), 1)
    assert.equal(resolveSmsSegments(161, 'GSM7'), 2)
    assert.equal(resolveSmsSegments(306, 'GSM7'), 2)
    assert.equal(resolveSmsSegments(307, 'GSM7'), 3)
    assert.equal(resolveSmsSegments(70, 'UCS2'), 1)
    assert.equal(resolveSmsSegments(71, 'UCS2'), 2)
    assert.equal(resolveSmsSegments(134, 'UCS2'), 2)
    assert.equal(resolveSmsSegments(135, 'UCS2'), 3)
})
