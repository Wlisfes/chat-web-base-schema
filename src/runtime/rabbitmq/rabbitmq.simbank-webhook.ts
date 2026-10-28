import type { ConfirmChannel } from 'amqplib'
import {
    SMS_SIMBANK_WEBHOOK_DEAD_QUEUE,
    SMS_SIMBANK_WEBHOOK_DEAD_ROUTING_KEY,
    SMS_SIMBANK_WEBHOOK_QUEUE,
    SMS_SIMBANK_WEBHOOK_ROUTING_KEY,
    SMS_SIMBANK_WEBHOOK_DEAD_EXCHANGE,
    SMS_SIMBANK_WEBHOOK_EXCHANGE
} from './rabbitmq.interface'

/**
 * 声明设备回执拓扑：Hooks（发布方）和 Dispatch（消费方）都在连接时调用，参数共用这一处，避免两边声明不一致被 RabbitMQ 拒绝。
 * 发布方也声明队列，保证 Dispatch 还没启动时回执不会因交换机没有绑定队列而被丢弃。
 */
export async function setupSimbankWebhookTopology(channel: ConfirmChannel): Promise<void> {
    await channel.assertExchange(SMS_SIMBANK_WEBHOOK_EXCHANGE, 'direct', { durable: true })
    await channel.assertExchange(SMS_SIMBANK_WEBHOOK_DEAD_EXCHANGE, 'direct', { durable: true })
    await channel.assertQueue(SMS_SIMBANK_WEBHOOK_DEAD_QUEUE, { durable: true })
    await channel.bindQueue(SMS_SIMBANK_WEBHOOK_DEAD_QUEUE, SMS_SIMBANK_WEBHOOK_DEAD_EXCHANGE, SMS_SIMBANK_WEBHOOK_DEAD_ROUTING_KEY)
    await channel.assertQueue(SMS_SIMBANK_WEBHOOK_QUEUE, {
        durable: true,
        deadLetterExchange: SMS_SIMBANK_WEBHOOK_DEAD_EXCHANGE,
        deadLetterRoutingKey: SMS_SIMBANK_WEBHOOK_DEAD_ROUTING_KEY
    })
    await channel.bindQueue(SMS_SIMBANK_WEBHOOK_QUEUE, SMS_SIMBANK_WEBHOOK_EXCHANGE, SMS_SIMBANK_WEBHOOK_ROUTING_KEY)
}
