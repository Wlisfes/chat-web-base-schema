import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export interface MysqlConfig {
    host: string
    port: number | string
    username: string
    password: string
    database?: string
    name?: string
    charset?: string
    timezone?: string
    logging?: boolean | string
    poolSize?: number | string
    connectTimeout?: number | string
    retryAttempts?: number | string
    retryDelay?: number | string
}

export type MysqlEnvironmentField = 'host' | 'port' | 'username' | 'password' | 'database'

export interface MysqlRuntimeOptions {
    configKey: string
    entities: NonNullable<TypeOrmModuleOptions['entities']>
    environmentPrefix?: string
    environmentOverrides?: readonly MysqlEnvironmentField[]
    decimalNumbers?: boolean
}

type MysqlConfigRecord = Record<keyof MysqlConfig, unknown>

export function createMysqlOptions(configService: ConfigService, options: MysqlRuntimeOptions): TypeOrmModuleOptions {
    const configured = configService.get<unknown>(options.configKey)
    if (!configured || typeof configured !== 'object' || Array.isArray(configured)) {
        throw new Error(`缺少 Nacos 数据库配置节点：${options.configKey}`)
    }
    const config = configured as MysqlConfigRecord
    const environmentFields = new Set(options.environmentOverrides ?? [])
    const environment = (field: MysqlEnvironmentField): string | undefined => {
        if (!options.environmentPrefix || !environmentFields.has(field)) {
            return undefined
        }
        const key = `${options.environmentPrefix}_${field.toUpperCase()}`
        const value = configService.get<string | number>(key)
        if (value === undefined || value === null || value === '') {
            return undefined
        }
        const normalized = String(value).trim()
        if (!normalized) {
            throw new Error(`环境变量 ${key} 必须是非空字符串`)
        }
        return normalized
    }

    const database = environment('database') ?? getDatabaseName(config, options.configKey)
    const portOverride = environment('port')
    const port = portOverride === undefined ? getInteger(config, 'port', 3306, 1, 65_535, options.configKey) : Number(portOverride)
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
        throw new Error(`环境变量 ${options.environmentPrefix}_PORT 必须是 1-65535 之间的整数`)
    }

    return {
        type: 'mysql',
        connectorPackage: 'mysql2',
        host: environment('host') ?? getRequiredString(config, 'host', options.configKey),
        port,
        username: environment('username') ?? getRequiredString(config, 'username', options.configKey),
        password: environment('password') ?? getRequiredString(config, 'password', options.configKey),
        database,
        charset: getOptionalString(config, 'charset', 'utf8mb4', options.configKey),
        timezone: getOptionalString(config, 'timezone', '+08:00', options.configKey),
        logging: getBoolean(config, 'logging', false, options.configKey),
        poolSize: getInteger(config, 'poolSize', 10, 1, 1000, options.configKey),
        connectTimeout: getInteger(config, 'connectTimeout', 10_000, 1, Number.MAX_SAFE_INTEGER, options.configKey),
        retryAttempts: getInteger(config, 'retryAttempts', 5, 0, 100, options.configKey),
        retryDelay: getInteger(config, 'retryDelay', 3000, 0, Number.MAX_SAFE_INTEGER, options.configKey),
        supportBigNumbers: true,
        bigNumberStrings: true,
        ...(options.decimalNumbers ? { extra: { decimalNumbers: true } } : {}),
        entities: options.entities,
        synchronize: false,
        migrationsRun: false
    }
}

function getRequiredString(config: MysqlConfigRecord, key: keyof MysqlConfig, configKey: string): string {
    const value = config[key]
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`数据库配置 ${configKey}.${key} 必须是非空字符串`)
    }
    return value.trim()
}

function getOptionalString(config: MysqlConfigRecord, key: keyof MysqlConfig, fallback: string, configKey: string): string {
    const value = config[key]
    return value === undefined || value === null || value === '' ? fallback : getRequiredString(config, key, configKey)
}

function getDatabaseName(config: MysqlConfigRecord, configKey: string): string {
    const value = config.database ?? config.name
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`数据库配置 ${configKey}.database 或 name 必须是非空字符串`)
    }
    return value.trim()
}

function getInteger(
    config: MysqlConfigRecord,
    key: keyof MysqlConfig,
    fallback: number,
    minimum: number,
    maximum: number,
    configKey: string
): number {
    const configured = config[key]
    const value = configured === undefined || configured === null || configured === '' ? fallback : Number(configured)
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(`数据库配置 ${configKey}.${key} 必须是 ${minimum}-${maximum} 之间的整数`)
    }
    return value
}

function getBoolean(config: MysqlConfigRecord, key: keyof MysqlConfig, fallback: boolean, configKey: string): boolean {
    const value = config[key]
    if (value === undefined || value === null || value === '') {
        return fallback
    }
    if (typeof value === 'boolean') {
        return value
    }
    if (value === 'true' || value === 'false') {
        return value === 'true'
    }
    throw new Error(`数据库配置 ${configKey}.${key} 必须是布尔值`)
}
