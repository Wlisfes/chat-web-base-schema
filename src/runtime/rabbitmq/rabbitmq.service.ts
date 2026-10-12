import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown, Optional } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { connect } from 'amqplib'
import type { ConfirmChannel, ConsumeMessage, RecoveringChannelModel } from 'amqplib'
import { NacosService } from '../nacos/nacos.service'
import * as RabbitmqTypes from './rabbitmq.interface'

const DEFAULT_RABBITMQ_CONFIG_KEY = 'rabbitmq'
const DEFAULT_RABBITMQ_PORT = 5672
const DEFAULT_RABBITMQ_HEARTBEAT = 30
const DEFAULT_RABBITMQ_PREFETCH = 10

/** 已注册的消费者，断线重连后需要重新订阅。 */
interface RabbitmqConsumer {
    queue: string
    handler: RabbitmqTypes.RabbitmqConsumeHandler
}

function requiredString(name: string, value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} 必须是非空字符串`)
    return value.trim()
}

function parseInteger(name: string, value: unknown, fallback: number, minimum: number, maximum: number): number {
    if (value === undefined || value === null || value === '') return fallback
    const configured = Number(value)
    if (!Number.isInteger(configured) || configured < minimum || configured > maximum) {
        throw new Error(`${name} 必须是 ${minimum}-${maximum} 之间的整数`)
    }
    return configured
}

function parseOptionalBoolean(name: string, value: unknown): boolean {
    if (value === undefined || value === null || value === '') return false
    if (typeof value === 'boolean') return value
    if (value === 'true') return true
    if (value === 'false') return false
    throw new Error(`${name} 必须是布尔值`)
}

function normalizeRuntimeOptions(options: RabbitmqTypes.RabbitmqRuntimeOptions | undefined): RabbitmqTypes.RabbitmqRuntimeOptions {
    if (!options || typeof options !== 'object') throw new Error('RabbitmqRuntimeOptions 必须是对象')
    return {
        vhost: requiredString('RabbitmqRuntimeOptions.vhost', options.vhost),
        configKey:
            options.configKey === undefined
                ? DEFAULT_RABBITMQ_CONFIG_KEY
                : requiredString('RabbitmqRuntimeOptions.configKey', options.configKey),
        setup: options.setup
    }
}

/**
 * RabbitMQ 连接与发布、消费封装。
 *
 * - 连接配置只从 Nacos 读取，虚拟主机必须与服务运行时选项一致；
 * - 使用 amqplib 自带的断线自动恢复，每次重连后重新声明拓扑并恢复消费者；
 * - 发布使用确认通道，等待 Broker 确认后才返回，消息默认持久化；
 * - 消费按回调返回值确认、重新入队或拒绝（进入死信），回调异常按拒绝处理。
 */
@Injectable()
export class RabbitmqService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(RabbitmqService.name)
    private readonly options: RabbitmqTypes.RabbitmqRuntimeOptions
    private readonly consumers: RabbitmqConsumer[] = []
    private model?: RecoveringChannelModel
    private channel?: ConfirmChannel
    private prefetch = DEFAULT_RABBITMQ_PREFETCH
    private closing = false

    constructor(
        private readonly configService: ConfigService,
        @Inject(RabbitmqTypes.RABBITMQ_RUNTIME_OPTIONS) options: RabbitmqTypes.RabbitmqRuntimeOptions,
        @Optional() private readonly nacosService?: NacosService
    ) {
        this.options = normalizeRuntimeOptions(options)
    }

    async onApplicationBootstrap(): Promise<void> {
        await this.nacosService?.loadConfig()
        const config = this.getConfig()
        const protocol = parseOptionalBoolean('RabbitMQ 配置 tls', config.tls) ? 'amqps' : 'amqp'
        this.prefetch = parseInteger('RabbitMQ 配置 prefetch', config.prefetch, DEFAULT_RABBITMQ_PREFETCH, 1, 1000)
        this.logger.log(`RabbitMQ连接配置已解析：source=nacos, protocol=${protocol}, vhost=${config.vhost}, prefetch=${this.prefetch}`)
        this.model = await connect(
            {
                protocol,
                hostname: requiredString('RabbitMQ 配置 host', config.host),
                port: parseInteger('RabbitMQ 配置 port', config.port, DEFAULT_RABBITMQ_PORT, 1, 65_535),
                username: requiredString('RabbitMQ 配置 username', config.username),
                password: requiredString('RabbitMQ 配置 password', config.password),
                vhost: config.vhost,
                heartbeat: parseInteger('RabbitMQ 配置 heartbeat', config.heartbeat, DEFAULT_RABBITMQ_HEARTBEAT, 0, 600)
            },
            {
                recovery: {
                    initialDelay: 500,
                    maxDelay: 30_000,
                    initialMaxRetries: 5,
                    setup: async () => {
                        await this.openChannel()
                    }
                }
            }
        )
        this.model.on('disconnect', error => this.logger.warn(`RabbitMQ连接已断开，正在自动重连：${this.errorMessage(error)}`))
        this.model.on('reconnect-failed', error => this.logger.error(`RabbitMQ重连失败：${this.errorMessage(error)}`))
        this.model.on('error', error => this.logger.error(`RabbitMQ连接错误：${this.errorMessage(error)}`))
        this.logger.log('RabbitMQ连接已就绪')
    }

    async onApplicationShutdown(): Promise<void> {
        this.closing = true
        await this.model?.close().catch(error => this.logger.warn(`关闭RabbitMQ连接失败：${this.errorMessage(error)}`))
    }

    /** 连接和通道均可用时返回 true，供健康检查使用。 */
    public isReady(): boolean {
        return Boolean(this.channel)
    }

    /** 发布 JSON 消息并等待 Broker 确认；Broker 拒绝或连接不可用时抛出异常，由调用方决定是否稍后补发。 */
    public async publish(
        exchange: string,
        routingKey: string,
        payload: unknown,
        options: RabbitmqTypes.RabbitmqPublishOptions = {}
    ): Promise<void> {
        const channel = this.getChannel()
        const { persistent = true, ...rest } = options
        const content = Buffer.from(JSON.stringify(payload))
        await new Promise<void>((resolve, reject) => {
            channel.publish(exchange, routingKey, content, { ...rest, persistent, contentType: 'application/json' }, error =>
                error ? reject(error instanceof Error ? error : new Error(String(error))) : resolve()
            )
        })
    }

    /** 注册队列消费者；断线重连后自动恢复订阅。 */
    public async consume<T = unknown>(queue: string, handler: RabbitmqTypes.RabbitmqConsumeHandler<T>): Promise<void> {
        const consumer: RabbitmqConsumer = { queue, handler: handler as RabbitmqTypes.RabbitmqConsumeHandler }
        this.consumers.push(consumer)
        if (this.channel) await this.subscribe(this.channel, consumer)
    }

    private async openChannel(): Promise<void> {
        if (!this.model || this.closing) return
        const channel = await this.model.createConfirmChannel()
        channel.on('error', error => this.logger.error(`RabbitMQ通道错误：${this.errorMessage(error)}`))
        channel.on('close', () => {
            if (this.channel === channel) this.channel = undefined
        })
        await channel.prefetch(this.prefetch)
        await this.options.setup?.(channel)
        this.channel = channel
        for (const consumer of this.consumers) await this.subscribe(channel, consumer)
    }

    private async subscribe(channel: ConfirmChannel, consumer: RabbitmqConsumer): Promise<void> {
        await channel.consume(consumer.queue, message => {
            if (message) void this.handleMessage(channel, consumer, message)
        })
        this.logger.log(`RabbitMQ消费者已订阅：${consumer.queue}`)
    }

    private async handleMessage(channel: ConfirmChannel, consumer: RabbitmqConsumer, message: ConsumeMessage): Promise<void> {
        let action: RabbitmqTypes.RabbitmqConsumeAction
        try {
            const payload = JSON.parse(message.content.toString('utf8')) as unknown
            action = await consumer.handler(payload, message)
        } catch (error) {
            this.logger.error(`RabbitMQ消息处理失败，已拒绝：queue=${consumer.queue}，原因=${this.errorMessage(error)}`)
            action = 'reject'
        }
        try {
            if (action === 'ack') channel.ack(message)
            else channel.nack(message, false, action === 'requeue')
        } catch (error) {
            // 通道已关闭时确认会失败，消息会由 Broker 重新投递，不能让异常中断消费循环。
            this.logger.warn(`RabbitMQ消息确认失败，等待重新投递：${this.errorMessage(error)}`)
        }
    }

    private getChannel(): ConfirmChannel {
        if (!this.channel) throw new Error('RabbitMQ 通道尚未就绪')
        return this.channel
    }

    private getConfig(): RabbitmqTypes.RabbitmqConfig {
        const key = this.options.configKey ?? DEFAULT_RABBITMQ_CONFIG_KEY
        const configured = this.configService.get<unknown>(key)
        if (configured === undefined || configured === null) throw new Error(`缺少 Nacos RabbitMQ 配置节点：${key}`)
        if (typeof configured !== 'object' || Array.isArray(configured)) throw new Error(`RabbitMQ 配置 ${key} 必须是 YAML 对象`)
        const config = configured as RabbitmqTypes.RabbitmqConfig
        const vhost = requiredString('RabbitMQ 配置 vhost', config.vhost)
        if (vhost !== this.options.vhost) throw new Error(`RabbitMQ 配置 vhost 必须使用本服务分配的虚拟主机：${this.options.vhost}`)
        return { ...config, vhost }
    }

    private errorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error)
    }
}
