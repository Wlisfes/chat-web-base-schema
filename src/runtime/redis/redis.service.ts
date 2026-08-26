import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, RedisClientType } from 'redis'

@Injectable()
export class RedisService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(RedisService.name)
    private client?: RedisClientType

    constructor(private readonly configService: ConfigService) {}

    async onApplicationBootstrap(): Promise<void> {
        const connectionUrl = this.getConnectionUrl()
        const parsedConnectionUrl = new URL(connectionUrl)
        this.logger.log(
            `Redis连接配置已解析：source=${this.configService.get<string>('REDIS_URL')?.trim() ? 'url' : 'host'}, ` +
                `authenticated=${Boolean(parsedConnectionUrl.password)}, tls=${parsedConnectionUrl.protocol === 'rediss:'}, ` +
                `database=${parsedConnectionUrl.pathname.slice(1) || '0'}`
        )
        const client = createClient({
            url: connectionUrl,
            socket: {
                connectTimeout: this.getInteger('REDIS_CONNECT_TIMEOUT_MS', 5000, 100, 60_000),
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
        const configuredUrl = this.configService.get<string>('REDIS_URL')?.trim()
        if (configuredUrl) {
            let url: URL
            try {
                url = new URL(configuredUrl)
            } catch {
                throw new Error('REDIS_URL 格式无效')
            }
            if (!['redis:', 'rediss:'].includes(url.protocol)) {
                throw new Error('REDIS_URL 必须使用 redis:// 或 rediss://')
            }
            const password = this.configService.get<string>('REDIS_PASSWORD')
            if (!url.password && password) {
                const username = this.configService.get<string>('REDIS_USERNAME')?.trim()
                if (username && !url.username) {
                    url.username = username
                }
                url.password = password
            }
            const database = this.getOptionalInteger('REDIS_DATABASE', 0, 15)
            if (database !== undefined) {
                url.pathname = `/${database}`
            }
            return url.toString()
        }

        const host = this.configService.get<string>('REDIS_HOST')?.trim() || 'chat-web-redis'
        const port = this.getInteger('REDIS_PORT', 6379, 1, 65_535)
        const database = this.getInteger('REDIS_DATABASE', 0, 0, 15)
        const username = this.configService.get<string>('REDIS_USERNAME')?.trim()
        const password = this.configService.get<string>('REDIS_PASSWORD')
        const credentials = password
            ? `${username ? `${encodeURIComponent(username)}:` : ':'}${encodeURIComponent(password)}@`
            : username
              ? `${encodeURIComponent(username)}@`
              : ''
        const protocol = this.configService.get<string>('REDIS_TLS') === 'true' ? 'rediss' : 'redis'
        return `${protocol}://${credentials}${host}:${port}/${database}`
    }

    private normalizeValue(value: string | Buffer | null): string | null {
        return Buffer.isBuffer(value) ? value.toString('utf8') : value
    }

    private getInteger(key: string, fallback: number, minimum: number, maximum: number): number {
        const configured = this.configService.get<string | number>(key)
        const value = configured === undefined || configured === null || configured === '' ? fallback : Number(configured)
        if (!Number.isInteger(value) || value < minimum || value > maximum) {
            throw new Error(`${key} 必须是 ${minimum}-${maximum} 之间的整数`)
        }
        return value
    }

    private getOptionalInteger(key: string, minimum: number, maximum: number): number | undefined {
        const configured = this.configService.get<string | number>(key)
        if (configured === undefined || configured === null || configured === '') {
            return undefined
        }
        const value = Number(configured)
        if (!Number.isInteger(value) || value < minimum || value > maximum) {
            throw new Error(`${key} 必须是 ${minimum}-${maximum} 之间的整数`)
        }
        return value
    }
}
