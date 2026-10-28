const test = require('node:test')
const assert = require('node:assert/strict')
const { signObserveReceipt, verifyObserveReceipt, OBSERVE_PATTERN } = require('../dist/src/runtime/observe')
const { setupObserveReceiptTopology, SMS_OBSERVE_RECEIPT_QUEUE } = require('../dist/src/runtime/rabbitmq')

test('回执签名：密钥、时间戳和原文一致才通过，超出有效期拒绝', () => {
    const body = JSON.stringify({ msgId: 'm1' })
    const now = 1_800_000_000_000
    const signature = signObserveReceipt('secret', now, body)
    assert.equal(verifyObserveReceipt({ secret: 'secret', timestamp: String(now), signature, body, now }), true)
    assert.equal(verifyObserveReceipt({ secret: 'other', timestamp: String(now), signature, body, now }), false)
    assert.equal(verifyObserveReceipt({ secret: 'secret', timestamp: String(now), signature, body: '{}', now }), false)
    assert.equal(verifyObserveReceipt({ secret: 'secret', timestamp: String(now), signature: 'abc', body, now }), false)
    assert.equal(verifyObserveReceipt({ secret: 'secret', timestamp: String(now), signature, body, now: now + 6 * 60 * 1000 }), false)
    assert.equal(verifyObserveReceipt({ secret: '', timestamp: String(now), signature, body, now }), false)
    assert.equal(OBSERVE_PATTERN.ENQUEUE, 'observe.sms.enqueue')
})

test('回执拓扑：回执队列绑定死信', async () => {
    const calls = []
    const channel = new Proxy(
        {},
        {
            get:
                (_target, name) =>
                async (...args) =>
                    calls.push([name, ...args])
        }
    )
    await setupObserveReceiptTopology(channel)
    const queue = calls.find(call => call[0] === 'assertQueue' && call[1] === SMS_OBSERVE_RECEIPT_QUEUE)
    assert.equal(queue[2].deadLetterExchange, 'chat.sms.receipt.dead.exchange')
})
