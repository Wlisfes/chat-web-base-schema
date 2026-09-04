import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown, Optional } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, RedisClientType } from 'redis'
import { NacosService } from '../nacos/nacos.service'
import { REDIS_RUNTIME_OPTIONS, RedisConfig, RedisRuntimeOptions } from './redis.interface'

const DEFAULT_REDIS_CONFIG_KEY = 'redis'

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function requiredString(name: string, value: unknown): string {
    const normalized = optionalString(value)
    if (!normalized) {
        throw new Error(`${name} 必须是非空字符串`)
    }
    return normalized
}

function optionalCredential(name: string, value: unknown): string | undefined {
    if (value === undefined || value === null || value === '') return undefined
    if (typeof value !== 'string') throw new Error(`${name} 必须是字符串`)
    return value.trim() || undefined
}

function parseInteger(name: string, value: unknown, minimum: number, maximum: number): number {
    if (value === undefined || value === null || value === '') {
        throw new Error(`${name} 必须配置`)
    }
    const configured = Number(value)
    if (!Number.isInteger(configured) || configured < minimum || configured > maximum) {
        throw new Error(`${name} 必须是 ${minimum}-${maximum} 之间的整数`)
    }
    return configured
}

function parseOptionalBoolean(name: string, value: unknown): boolean | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined
    }
    if (typeof value === 'boolean') return value
    if (value === 'true') return true
    if (value === 'false') return false
    throw new Error(`${name} 必须是布尔值`)
}

function normalizeRuntimeOptions(options: RedisRuntimeOptions | undefined): RedisRuntimeOptions | undefined {
    if (options === undefined) return undefined
    if (!options || typeof options !== 'object') {
        throw new Error('RedisRuntimeOptions 必须是对象')
    }
    const database = parseInteger('RedisRuntimeOptions.database', options.database, 0, 15)
    const configKey =
        options.configKey === undefined ? DEFAULT_REDIS_CONFIG_KEY : requiredString('RedisRuntimeOptions.configKey', options.configKey)
    return { database, configKey }
}

@Injectable()
export class RedisService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(RedisService.name)
    private readonly options?: RedisRuntimeOptions
    private client?: RedisClientType

    constructor(
        private readonly configService: ConfigService,
        @Optional() @Inject(REDIS_RUNTIME_OPTIONS) options?: RedisRuntimeOptions,
        @Optional() private readonly nacosService?: NacosService
    ) {
        this.options = normalizeRuntimeOptions(options)
    }

    async onApplicationBootstrap(): Promise<void> {
        await this.nacosService?.loadConfig()
        const connectionUrl = this.getConnectionUrl()
        const parsedConnectionUrl = new URL(connectionUrl)
        const connectTimeout = this.getConnectTimeout()
        this.logger.log(
            'Redis连接配置已解析：source=nacos, ' +
                `authenticated=${Boolean(parsedConnectionUrl.password)}, tls=${parsedConnectionUrl.protocol === 'rediss:'}, ` +
                `database=${parsedConnectionUrl.pathname.slice(1) || '0'}`
        )
        const client = createClient({
            url: connectionUrl,
            socket: {
                ...(connectTimeout === undefined ? {} : { connectTimeout }),
                reconnectStrategy: retries => Math.min(retries * 200, 3000)
            }
        })
        client.on('error', error => this.logger.error(`Redis连接错误：${error instanceof Error ? error.message : String(error)}`))
        this.client = client
        await client.connect()
        await client.ping()
        this.logger.log('Redis连接已就绪')
    }

    async onApplicationShutdown(): Promise<void> {
        if (this.client?.isOpen) {
            await this.client.quit()
        }
    }

    async ping(): Promise<boolean> {
        const client = this.client
        return Boolean(client?.isReady && (await client.ping()) === 'PONG')
    }

    async get(key: string): Promise<string | null> {
        return this.normalizeValue(await this.getClient().get(key))
    }

    async getDel(key: string): Promise<string | null> {
        return this.normalizeValue(await this.getClient().getDel(key))
    }

    async setEx(key: string, seconds: number, value: string): Promise<void> {
        await this.getClient().setEx(key, seconds, value)
    }

    async del(key: string): Promise<void> {
        await this.getClient().del(key)
    }

    async rotate(oldKey: string, newKey: string, seconds: number, value: string): Promise<void> {
        await this.getClient().multi().setEx(newKey, seconds, value).del(oldKey).exec()
    }

    private getClient(): RedisClientType {
        if (!this.client) {
            throw new Error('Redis 客户端尚未完成应用启动初始化')
        }
        return this.client
    }

    private getConnectionUrl(): string {
        const configured = this.getRedisConfig()
        const expectedDatabase = this.options?.database
        const database = this.resolveDatabase(configured.database, expectedDatabase)
        const host = requiredString('Redis 配置 host', configured.host)
        const port = parseInteger('Redis 配置 port', configured.port, 1, 65_535)
        const username = optionalCredential('Redis 配置 username', configured.username)
        const password = optionalCredential('Redis 配置 password', configured.password)
        const credentials = password
            ? `${username ? `${encodeURIComponent(username)}:` : ':'}${encodeURIComponent(password)}@`
            : username
              ? `${encodeURIComponent(username)}@`
              : ''
        const tls = parseOptionalBoolean('Redis 配置 tls', configured.tls)
        const protocol = tls ? 'rediss' : 'redis'
        return `${protocol}://${credentials}${host}:${port}/${database}`
    }

    private getRedisConfig(): RedisConfig {
        const key = this.options?.configKey ?? DEFAULT_REDIS_CONFIG_KEY
        const configured = this.configService.get<unknown>(key)
        if (configured === undefined || configured === null) {
            throw new Error(`缺少 Nacos Redis 配置节点：${key}`)
        }
        if (typeof configured !== 'object' || Array.isArray(configured)) {
            throw new Error(`Redis 配置 ${key} 必须是 YAML 对象`)
        }
        return configured as RedisConfig
    }

    private resolveDatabase(value: unknown, expectedDatabase: number | undefined): number {
        const configured = parseInteger('Redis 配置 database', value, 0, 15)
        if (expectedDatabase !== undefined && configured !== expectedDatabase) {
            throw new Error(`Redis 配置 database 必须使用本服务分配的 index：${expectedDatabase}`)
        }
        return expectedDatabase ?? configured
    }

    private getConnectTimeout(): number | undefined {
        const configured = this.getRedisConfig().connectTimeoutMs
        return configured === undefined || configured === null || configured === ''
            ? undefined
            : parseInteger('Redis 配置 connectTimeoutMs', configured, 100, 60_000)
    }

    private normalizeValue(value: string | Buffer | null): string | null {
        return Buffer.isBuffer(value) ? value.toString('utf8') : value
    }
}
