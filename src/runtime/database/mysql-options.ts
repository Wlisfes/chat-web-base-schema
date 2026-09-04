import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export interface MysqlConfig {
    host: string
    port: number | string
    username: string
    password: string
    database: string
    charset?: string
    timezone?: string
    logging?: boolean | string
    poolSize?: number | string
    connectTimeout?: number | string
    retryAttempts?: number | string
    retryDelay?: number | string
}

export interface MysqlRuntimeOptions {
    configKey: string
    entities: NonNullable<TypeOrmModuleOptions['entities']>
    decimalNumbers?: boolean
}

type MysqlConfigRecord = Record<keyof MysqlConfig, unknown>

export function createMysqlOptions(configService: ConfigService, options: MysqlRuntimeOptions): TypeOrmModuleOptions {
    const configured = configService.get<unknown>(options.configKey)
    if (!configured || typeof configured !== 'object' || Array.isArray(configured)) {
        throw new Error(`缺少 Nacos 数据库配置节点：${options.configKey}`)
    }
    const config = configured as MysqlConfigRecord
    const database = getRequiredString(config, 'database', options.configKey)
    const charset = getOptionalString(config, 'charset', options.configKey)
    const timezone = getOptionalString(config, 'timezone', options.configKey)
    const logging = getOptionalBoolean(config, 'logging', options.configKey)
    const poolSize = getOptionalInteger(config, 'poolSize', 1, 1000, options.configKey)
    const connectTimeout = getOptionalInteger(config, 'connectTimeout', 1, Number.MAX_SAFE_INTEGER, options.configKey)
    const retryAttempts = getOptionalInteger(config, 'retryAttempts', 0, 100, options.configKey)
    const retryDelay = getOptionalInteger(config, 'retryDelay', 0, Number.MAX_SAFE_INTEGER, options.configKey)

    return {
        type: 'mysql',
        connectorPackage: 'mysql2',
        host: getRequiredString(config, 'host', options.configKey),
        port: getInteger(config, 'port', 1, 65_535, options.configKey),
        username: getRequiredString(config, 'username', options.configKey),
        password: getRequiredString(config, 'password', options.configKey, true),
        database,
        ...(charset === undefined ? {} : { charset }),
        ...(timezone === undefined ? {} : { timezone }),
        ...(logging === undefined ? {} : { logging }),
        ...(poolSize === undefined ? {} : { poolSize }),
        ...(connectTimeout === undefined ? {} : { connectTimeout }),
        ...(retryAttempts === undefined ? {} : { retryAttempts }),
        ...(retryDelay === undefined ? {} : { retryDelay }),
        supportBigNumbers: true,
        bigNumberStrings: true,
        ...(options.decimalNumbers ? { extra: { decimalNumbers: true } } : {}),
        entities: options.entities,
        synchronize: false,
        migrationsRun: false
    }
}

function getRequiredString(config: MysqlConfigRecord, key: keyof MysqlConfig, configKey: string, allowEmpty = false): string {
    const value = config[key]
    if (typeof value !== 'string' || (!allowEmpty && !value.trim())) {
        throw new Error(`数据库配置 ${configKey}.${key} 必须是${allowEmpty ? '字符串' : '非空字符串'}`)
    }
    return allowEmpty ? value : value.trim()
}

function getOptionalString(config: MysqlConfigRecord, key: keyof MysqlConfig, configKey: string): string | undefined {
    const value = config[key]
    if (value === undefined || value === null || value === '') return undefined
    return getRequiredString(config, key, configKey)
}

function getInteger(config: MysqlConfigRecord, key: keyof MysqlConfig, minimum: number, maximum: number, configKey: string): number {
    const configured = config[key]
    if (configured === undefined || configured === null || configured === '') {
        throw new Error(`数据库配置 ${configKey}.${key} 必须配置`)
    }
    const value = Number(configured)
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(`数据库配置 ${configKey}.${key} 必须是 ${minimum}-${maximum} 之间的整数`)
    }
    return value
}

function getOptionalInteger(
    config: MysqlConfigRecord,
    key: keyof MysqlConfig,
    minimum: number,
    maximum: number,
    configKey: string
): number | undefined {
    const value = config[key]
    return value === undefined || value === null || value === '' ? undefined : getInteger(config, key, minimum, maximum, configKey)
}

function getOptionalBoolean(config: MysqlConfigRecord, key: keyof MysqlConfig, configKey: string): boolean | undefined {
    const value = config[key]
    if (value === undefined || value === null || value === '') {
        return undefined
    }
    if (typeof value === 'boolean') {
        return value
    }
    if (value === 'true' || value === 'false') {
        return value === 'true'
    }
    throw new Error(`数据库配置 ${configKey}.${key} 必须是布尔值`)
}
