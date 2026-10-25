const test = require('node:test')
const assert = require('node:assert/strict')
const { RabbitmqService, RabbitmqModule, RABBITMQ_RUNTIME_OPTIONS } = require('../dist/src/runtime/rabbitmq')
const { FeignClientTaskManager, getFeignClientOptions } = require('../dist/src/feign')

function config(values) {
    return { get: key => values[key] }
}

const rabbitmq = { host: 'mq', port: 5672, username: 'chat_task', password: 'secret', vhost: '/chat-task' }

test('RabbitMQ 运行时必须声明虚拟主机，Nacos 配置必须使用同一虚拟主机', () => {
    assert.throws(() => new RabbitmqService(config({}), {}), /vhost 必须是非空字符串/)
    const service = new RabbitmqService(config({ rabbitmq: { ...rabbitmq, vhost: '/chat-sms' } }), { vhost: '/chat-task' })
    assert.throws(() => service.getConfig(), /必须使用本服务分配的虚拟主机：\/chat-task/)
    const ok = new RabbitmqService(config({ rabbitmq }), { vhost: '/chat-task' })
    assert.equal(ok.getConfig().vhost, '/chat-task')
    assert.equal(ok.isReady(), false)
})

test('RabbitMQ 缺少 Nacos 配置节点或配置不是对象时启动失败', () => {
    assert.throws(() => new RabbitmqService(config({}), { vhost: '/chat-task' }).getConfig(), /缺少 Nacos RabbitMQ 配置节点：rabbitmq/)
    assert.throws(() => new RabbitmqService(config({ rabbitmq: 'x' }), { vhost: '/chat-task' }).getConfig(), /必须是 YAML 对象/)
})

test('RabbitmqModule.forRoot 注册运行时选项和服务', () => {
    const setup = async () => {}
    const module = RabbitmqModule.forRoot({ vhost: '/chat-task', setup })
    assert.equal(module.module, RabbitmqModule)
    assert.deepEqual(module.exports, [RabbitmqService])
    assert.ok(module.providers.some(item => item.provide === RABBITMQ_RUNTIME_OPTIONS && item.useValue.setup === setup))
})

test('RabbitMQ 首次连接时使用 setup 回调传入的连接声明拓扑并恢复消费者', async () => {
    const calls = []
    const channel = {
        on: () => {},
        prefetch: async count => calls.push(['prefetch', count]),
        consume: async queue => calls.push(['consume', queue])
    }
    const model = { createConfirmChannel: async () => channel }
    const service = new RabbitmqService(config({}), { vhost: '/chat-task', setup: async value => calls.push(['setup', value === channel]) })
    service.consumers.push({ queue: 'chat.task.execute', handler: async () => 'ack' })
    await service.openChannel(model)
    assert.deepEqual(calls, [
        ['prefetch', 10],
        ['setup', true],
        ['consume', 'chat.task.execute']
    ])
    assert.equal(service.isReady(), true)
})

test('RabbitMQ 消费结果按回调返回值确认、重新入队或拒绝，回调异常按拒绝处理', async () => {
    const service = new RabbitmqService(config({}), { vhost: '/chat-task' })
    const calls = []
    const channel = {
        ack: message => calls.push(['ack', message.id]),
        nack: (message, allUpTo, requeue) => calls.push(['nack', message.id, requeue])
    }
    const message = (id, body) => ({ id, content: Buffer.from(JSON.stringify(body)) })
    const consumer = action => ({ queue: 'q', handler: async () => action })
    await service.handleMessage(channel, consumer('ack'), message(1, {}))
    await service.handleMessage(channel, consumer('requeue'), message(2, {}))
    await service.handleMessage(channel, consumer('reject'), message(3, {}))
    await service.handleMessage(
        channel,
        {
            queue: 'q',
            handler: async () => {
                throw new Error('boom')
            }
        },
        message(4, {})
    )
    await service.handleMessage(channel, consumer('ack'), { id: 5, content: Buffer.from('not-json') })
    assert.deepEqual(calls, [
        ['ack', 1],
        ['nack', 2, true],
        ['nack', 3, false],
        ['nack', 4, false],
        ['nack', 5, false]
    ])
})

test('RabbitMQ 取消消费者后不再随重连恢复，可再次订阅', async () => {
    const calls = []
    let tag = 0
    const channel = {
        on: () => {},
        prefetch: async () => {},
        consume: async queue => (calls.push(['consume', queue]), { consumerTag: 'tag-' + ++tag }),
        cancel: async consumerTag => calls.push(['cancel', consumerTag])
    }
    const service = new RabbitmqService(config({}), { vhost: '/chat-sms' })
    await service.openChannel({ createConfirmChannel: async () => channel })
    await service.consume('chat.sms.channel.A', async () => 'ack')
    await service.consume('chat.sms.channel.B', async () => 'ack')
    assert.equal(service.isConsuming('chat.sms.channel.A'), true)
    await service.cancel('chat.sms.channel.A')
    assert.equal(service.isConsuming('chat.sms.channel.A'), false)
    await service.cancel('chat.sms.channel.A')
    await service.openChannel({ createConfirmChannel: async () => channel })
    assert.deepEqual(calls, [
        ['consume', 'chat.sms.channel.A'],
        ['consume', 'chat.sms.channel.B'],
        ['cancel', 'tag-1'],
        ['consume', 'chat.sms.channel.B']
    ])
})

test('RabbitMQ 通道未就绪时发布直接失败，便于调用方稍后补发', async () => {
    const service = new RabbitmqService(config({}), { vhost: '/chat-task' })
    await assert.rejects(service.publish('ex', 'key', {}), /RabbitMQ 通道尚未就绪/)
})

test('Task Feign 客户端只走 /feign/task 服务间入口并使用独立超时配置', () => {
    const options = getFeignClientOptions(FeignClientTaskManager)
    assert.equal(options.prefix, '/feign/task')
    assert.equal(options.serviceTokenKey, 'gateway.feign.service_token')
    assert.equal(options.timeoutConfigKey, 'gateway.feign.task_timeout')
    const methods = Object.getOwnPropertyNames(FeignClientTaskManager.prototype).filter(name => name.startsWith('httpBaseTask'))
    assert.deepEqual(methods.sort(), [
        'httpBaseTaskColumnCron',
        'httpBaseTaskColumnExecution',
        'httpBaseTaskCronResolver',
        'httpBaseTaskCronStatusUpdate',
        'httpBaseTaskExecutionResolver',
        'httpBaseTaskTriggerCron',
        'httpBaseTaskUpdateCron'
    ])
})
