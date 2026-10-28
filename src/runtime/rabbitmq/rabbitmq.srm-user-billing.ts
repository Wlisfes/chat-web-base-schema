import type { ConfirmChannel } from 'amqplib'
import {
    SMS_BILLING_DEAD_EXCHANGE,
    SMS_BILLING_EXCHANGE,
    SMS_SRM_USER_BILLING_DEAD_QUEUE,
    SMS_SRM_USER_BILLING_DEAD_ROUTING_KEY,
    SMS_SRM_USER_BILLING_QUEUE,
    SMS_SRM_USER_BILLING_ROUTING_KEY
} from './rabbitmq.interface'

/**
 * 声明供应商计费拓扑：Dispatch（发布方）和 Finance（消费方）都在连接时调用，参数共用这一处，避免两边声明不一致被 RabbitMQ 拒绝。
 * 发布方也声明队列，保证 Finance 还没启动时计费事件不会因交换机没有绑定队列而被丢弃。
 */
export async function setupSrmUserBillingTopology(channel: ConfirmChannel): Promise<void> {
    await channel.assertExchange(SMS_BILLING_EXCHANGE, 'direct', { durable: true })
    await channel.assertExchange(SMS_BILLING_DEAD_EXCHANGE, 'direct', { durable: true })
    await channel.assertQueue(SMS_SRM_USER_BILLING_DEAD_QUEUE, { durable: true })
    await channel.bindQueue(SMS_SRM_USER_BILLING_DEAD_QUEUE, SMS_BILLING_DEAD_EXCHANGE, SMS_SRM_USER_BILLING_DEAD_ROUTING_KEY)
    await channel.assertQueue(SMS_SRM_USER_BILLING_QUEUE, {
        durable: true,
        deadLetterExchange: SMS_BILLING_DEAD_EXCHANGE,
        deadLetterRoutingKey: SMS_SRM_USER_BILLING_DEAD_ROUTING_KEY
    })
    await channel.bindQueue(SMS_SRM_USER_BILLING_QUEUE, SMS_BILLING_EXCHANGE, SMS_SRM_USER_BILLING_ROUTING_KEY)
}
