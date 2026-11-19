import type { ConfirmChannel } from 'amqplib'
import {
    SKYLINE_LOGGER_DEAD_EXCHANGE,
    SKYLINE_LOGGER_DEAD_QUEUE,
    SKYLINE_LOGGER_DEAD_ROUTING_KEY,
    SKYLINE_LOGGER_EXCHANGE,
    SKYLINE_LOGGER_QUEUE,
    SKYLINE_LOGGER_ROUTING_KEY
} from './rabbitmq.interface'

/**
 * 声明操作日志拓扑：发布方和 Hooks 都在连接时调用，参数共用这一处，避免两边声明不一致被 RabbitMQ 拒绝。
 * 发布方也声明队列，保证 Hooks 还没启动时日志不会因交换机没有绑定队列而被丢弃。
 */
export async function setupSkylineLoggerTopology(channel: ConfirmChannel): Promise<void> {
    await channel.assertExchange(SKYLINE_LOGGER_EXCHANGE, 'direct', { durable: true })
    await channel.assertExchange(SKYLINE_LOGGER_DEAD_EXCHANGE, 'direct', { durable: true })
    await channel.assertQueue(SKYLINE_LOGGER_DEAD_QUEUE, { durable: true })
    await channel.bindQueue(SKYLINE_LOGGER_DEAD_QUEUE, SKYLINE_LOGGER_DEAD_EXCHANGE, SKYLINE_LOGGER_DEAD_ROUTING_KEY)
    await channel.assertQueue(SKYLINE_LOGGER_QUEUE, {
        durable: true,
        deadLetterExchange: SKYLINE_LOGGER_DEAD_EXCHANGE,
        deadLetterRoutingKey: SKYLINE_LOGGER_DEAD_ROUTING_KEY
    })
    await channel.bindQueue(SKYLINE_LOGGER_QUEUE, SKYLINE_LOGGER_EXCHANGE, SKYLINE_LOGGER_ROUTING_KEY)
}
