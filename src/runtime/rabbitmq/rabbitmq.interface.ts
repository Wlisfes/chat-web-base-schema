import type { ConfirmChannel, ConsumeMessage, Options } from 'amqplib'

/** RabbitMQ 客户端从 Nacos `rabbitmq` 节点读取的配置。 */
export interface RabbitmqConfig {
    /** RabbitMQ 服务地址。 */
    host: string
    /** AMQP 端口，默认 5672。 */
    port?: number | string
    /** 访问账号。每个服务使用独立账号，只授权自己的虚拟主机。 */
    username: string
    /** 访问密码，只保存在 Nacos。 */
    password: string
    /** 虚拟主机，例如 `/chat-task`；必须与服务运行时选项一致。 */
    vhost: string
    /** 是否使用 TLS（amqps）；未配置时使用普通 AMQP 连接。 */
    tls?: boolean | string
    /** 心跳间隔，单位秒；未配置时使用 30 秒。 */
    heartbeat?: number | string
    /** 每个消费者未确认消息的最大数量；未配置时使用 10。 */
    prefetch?: number | string
}

/** RabbitmqModule 的服务边界与配置节点选项。 */
export interface RabbitmqRuntimeOptions {
    /** 本服务允许使用的虚拟主机，Nacos 配置必须与之一致，防止误连其他服务的虚拟主机。 */
    vhost: string
    /** Nacos 中的配置节点键名，默认 `rabbitmq`。 */
    configKey?: string
    /** 每次（重新）连接后执行的拓扑声明，例如声明交换机、队列和绑定关系。 */
    setup?: (channel: ConfirmChannel) => Promise<void>
}

/** 发布消息时使用的选项。 */
export interface RabbitmqPublishOptions extends Pick<Options.Publish, 'messageId' | 'headers' | 'expiration' | 'correlationId'> {
    /** 是否持久化消息，默认 true。 */
    persistent?: boolean
}

/** 运行时声明队列的选项。 */
export type RabbitmqQueueOptions = Options.AssertQueue

/** 消费者处理结果：确认、重新入队或拒绝（进入死信）。 */
export type RabbitmqConsumeAction = 'ack' | 'requeue' | 'reject'

/** 消费者回调；返回值决定消息的确认方式，抛出异常时按拒绝处理。 */
export type RabbitmqConsumeHandler<T = unknown> = (payload: T, message: ConsumeMessage) => Promise<RabbitmqConsumeAction>

/** `RabbitmqRuntimeOptions` 的 NestJS 注入令牌。 */
export const RABBITMQ_RUNTIME_OPTIONS = Symbol('RABBITMQ_RUNTIME_OPTIONS')
