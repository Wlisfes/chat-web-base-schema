import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown, Optional } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, RedisClientType } from 'redis'
import { NacosService } from '../nacos/nacos.service'
import { REDIS_RUNTIME_OPTIONS, RedisConfig, RedisRuntimeOptions } from './redis.interface'

const DEFAULT_REDIS_CONFIG_KEY = 'redis'
const DEFAULT_REDIS_HOST = 'chat-web-redis'
const DEFAULT_REDIS_PORT = 6379
const DEFAULT_REDIS_DATABASE = 0
const DEFAULT_REDIS_CONNECT_TIMEOUT = 5000

function isConfigured(value: unknown): boolean {
    return value !== undefined && value !== null && value !== ''
}

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

function parseInteger(name: string, value: unknown, fallback: number, minimum: number, maximum: number): number {
    const configured = isConfigured(value) ? Number(value) : fallback
    if (!Number.isInteger(configured) || configured < minimum || configured > maximum) {
        throw new Error(`${name} 必须是 ${minimum}-${maximum} 之间的整数`)
    }
    return configured
}

function parseBoolean(name: string, value: unknown, fallback: boolean): boolean {
    if (!isConfigured(value)) return fallback
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
    const database = parseInteger('RedisRuntimeOptions.database', options.database, DEFAULT_REDIS_DATABASE, 0, 15)
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
        this.logger.log(
            `Redis连接配置已解析：source=${this.getConfigSource()}, ` +
                `authenticated=${Boolean(parsedConnectionUrl.password)}, tls=${parsedConnectionUrl.protocol === 'rediss:'}, ` +
                `database=${parsedConnectionUrl.pathname.slice(1) || '0'}`
        )
        const client = createClient({
            url: connectionUrl,
            socket: {
                connectTimeout: this.getConnectTimeout(),
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
        const configuredUrl = optionalString(this.getOverride('REDIS_URL') ?? configured.url)
        const expectedDatabase = this.options?.database
        const configuredDatabase = this.getOverride('REDIS_DATABASE') ?? configured.database
        const database = this.resolveDatabase(configuredDatabase, expectedDatabase, configuredUrl)

        if (configuredUrl) {
            let url: URL
            try {
                url = new URL(configuredUrl)
            } catch {
                throw new Error('Redis URL 格式无效')
            }
            if (!['redis:', 'rediss:'].includes(url.protocol)) {
                throw new Error('Redis URL 必须使用 redis:// 或 rediss://')
            }
            const username = optionalString(this.getOverride('REDIS_USERNAME') ?? configured.username)
            const password = optionalString(this.getOverride('REDIS_PASSWORD') ?? configured.password)
            if (!url.username && username) url.username = username
            if (!url.password && password) url.password = password
            if (expectedDatabase !== undefined || isConfigured(configuredDatabase)) {
                url.pathname = `/${database}`
            }
            return url.toString()
        }

        const host = requiredString('Redis 配置 host', this.getOverride('REDIS_HOST') ?? configured.host ?? DEFAULT_REDIS_HOST)
        const port = parseInteger('Redis 配置 port', this.getOverride('REDIS_PORT') ?? configured.port, DEFAULT_REDIS_PORT, 1, 65_535)
        const username = optionalString(this.getOverride('REDIS_USERNAME') ?? configured.username)
        const password = optionalString(this.getOverride('REDIS_PASSWORD') ?? configured.password)
        const credentials = password
            ? `${username ? `${encodeURIComponent(username)}:` : ':'}${encodeURIComponent(password)}@`
            : username
              ? `${encodeURIComponent(username)}@`
              : ''
        const tls = parseBoolean('Redis 配置 tls', this.getOverride('REDIS_TLS') ?? configured.tls, false)
        const protocol = tls ? 'rediss' : 'redis'
        return `${protocol}://${credentials}${host}:${port}/${database}`
    }

    private getRedisConfig(): RedisConfig {
        const key = this.options?.configKey ?? DEFAULT_REDIS_CONFIG_KEY
        const configured = this.configService.get<unknown>(key)
        if (configured === undefined || configured === null) {
            return {}
        }
        if (typeof configured !== 'object' || Array.isArray(configured)) {
            throw new Error(`Redis 配置 ${key} 必须是 YAML 对象`)
        }
        return configured as RedisConfig
    }

    private getOverride(key: string): string | number | boolean | undefined {
        const value = this.configService.get<string | number | boolean>(key)
        return isConfigured(value) ? value : undefined
    }

    private resolveDatabase(value: unknown, expectedDatabase: number | undefined, configuredUrl: string | undefined): number {
        if (!isConfigured(value) && expectedDatabase === undefined && configuredUrl) {
            try {
                const pathname = new URL(configuredUrl).pathname.slice(1)
                if (pathname) return parseInteger('Redis URL database', pathname, DEFAULT_REDIS_DATABASE, 0, 15)
            } catch {
                // URL validation and the final error are handled by getConnectionUrl().
            }
        }
        const configured = parseInteger('Redis 配置 database', value, expectedDatabase ?? DEFAULT_REDIS_DATABASE, 0, 15)
        if (expectedDatabase !== undefined && configured !== expectedDatabase) {
            throw new Error(`Redis 配置 database 必须使用本服务分配的 index：${expectedDatabase}`)
        }
        return expectedDatabase ?? configured
    }

    private getConnectTimeout(): number {
        const configured = this.getOverride('REDIS_CONNECT_TIMEOUT_MS')
        const remote = this.getRedisConfig().connectTimeoutMs
        return parseInteger('Redis 配置 connectTimeoutMs', configured ?? remote, DEFAULT_REDIS_CONNECT_TIMEOUT, 100, 60_000)
    }

    private getConfigSource(): 'url' | 'nested' | 'host' {
        if (this.getOverride('REDIS_URL') || optionalString(this.getRedisConfig().url)) return 'url'
        if (this.configService.get<unknown>(this.options?.configKey ?? DEFAULT_REDIS_CONFIG_KEY)) return 'nested'
        return 'host'
    }

    private normalizeValue(value: string | Buffer | null): string | null {
        return Buffer.isBuffer(value) ? value.toString('utf8') : value
    }
}
