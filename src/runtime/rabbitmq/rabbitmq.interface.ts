import type { ConfirmChannel, ConsumeMessage, Options } from 'amqplib'
import type { Omix } from '@/types'

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

/** SMS 提交的短信。字段改动时要同步。 */
export interface MessageSubmitPayload extends Omix {
    /** 本次提交生成的 UUID 标识，当前不落库。 */
    msgId: string
    /** 提交短信的客户主键 */
    userKeyId: number
    /** 提交短信的客户名称 */
    userName: string
    /** 提交短信的应用主键：路由的应用绑定按它查询 */
    appKeyId: number
    /** 提交短信的应用ID */
    appId: string
    /** 短信类型：MRKT、NTFY、SOTP */
    type: 'MRKT' | 'NTFY' | 'SOTP'
    /** 方向：Skyline 国家/地区主键；SMS 可能传字符串，选路前统一转数字 */
    countryKeyId: number | string
    /** 号码所在国家的 MCC */
    mcc: string
    /** 接收号码：含国际区号，不带 + 号。 */
    toNumber: string
    /** 短信内容。 */
    content: string
    /** 内容字符数 */
    contentLength: number
    /** 编码方式 */
    encoding: 'UCS2' | 'GSM7'
    /** 计费条数 */
    segments: number
    /** 客户售价：USD总额(放大百万倍存储) */
    price: number
    /** 提交时间，ISO-8601。 */
    submitTime: string
    /** 提交短信任务的ID */
    taskId?: number
    /** 提交短信任务的名称 */
    taskName?: string
    /** 提交短信的模板ID */
    templateId?: string
}

/** 选路后投递到通道队列的短信。字段改动时要同步。 */
export interface ChannelSubmitPayload extends Omix {
    /**路由主键ID**/
    routeKeyId: number
    /**路由别名**/
    routeAlias: string
    /**通道主键ID**/
    channelKeyId: number
    /**通道别名**/
    channelAlias: string
    /** 提交时间，ISO-8601。 */
    submitTime: string
}

/** Channel 选路后投递到通道队列的短信：短信内容和选路结果分开传递。 */
export interface ChannelQueuePayload extends Omix {
    /**SMS 提交的短信**/
    message: MessageSubmitPayload
    /**Channel 选路结果**/
    route: ChannelSubmitPayload
}

/** SRM 发布的通道事件，携带通道完整状态。version 取发布时间毫秒数，只接受比副本更新的版本。 */
export interface ChannelEventPayload extends Omix {
    /**通道主键ID**/
    channelKeyId: number
    /**通道别名：全表唯一且创建后不可修改**/
    alias: string
    /**通道队列名称：chat.sms.channel.<通道别名>**/
    queue: string
    /**短信类型**/
    type: string
    /**方向：Skyline 国家/地区主键**/
    countryKeyId: number
    /**通道状态**/
    status: string
    /**发送间隔，毫秒**/
    sendInterval: number
    /**最大重试次数**/
    maxRetry: number
    /**true 表示通道已删除**/
    deleted: boolean
    /**发布时间毫秒数**/
    version: number
}

/** SRM 启动时发布的全量通道快照，队列只保留最新一份。 */
export interface ChannelSnapshotPayload extends Omix {
    /**发布时间毫秒数**/
    version: number
    /**全部通道**/
    channels: ChannelEventPayload[]
}

/** 选路和发送配置变更广播：只带版本号（发布时间毫秒数），收到后整体重新加载缓存。 */
export interface RouteConfigPayload extends Omix {
    /**发布时间毫秒数**/
    version: number
}
