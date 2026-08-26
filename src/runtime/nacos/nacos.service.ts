import { networkInterfaces } from 'node:os'
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NacosConfigClient, NacosNamingClient } from 'nacos'
import { NACOS_RUNTIME_OPTIONS, NacosRuntimeOptions } from './nacos.interface'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const yaml = require('js-yaml')

type RegisteredInstance = {
    ip: string
    port: number
}

type ClosableNacosNamingClient = NacosNamingClient & {
    close: () => Promise<void>
}

function requiredString(property: string, value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`NacosRuntimeOptions.${property} 必须是非空字符串`)
    }
    return value.trim()
}

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function positiveInteger(property: string, value: unknown, maximum = Number.MAX_SAFE_INTEGER): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > maximum) {
        throw new Error(`NacosRuntimeOptions.${property} 必须是 1-${maximum} 之间的整数`)
    }
    return value
}

function booleanOption(property: string, value: unknown): boolean {
    if (typeof value !== 'boolean') {
        throw new Error(`NacosRuntimeOptions.${property} 必须是布尔值`)
    }
    return value
}

function normalizeOptions(options: NacosRuntimeOptions): NacosRuntimeOptions {
    if (!options || typeof options !== 'object') {
        throw new Error('NacosRuntimeOptions 必须是对象')
    }
    return {
        serverAddr: requiredString('serverAddr', options.serverAddr),
        namespace: requiredString('namespace', options.namespace),
        username: optionalString(options.username),
        password: optionalString(options.password),
        requestTimeout: positiveInteger('requestTimeout', options.requestTimeout),
        configDataId: requiredString('configDataId', options.configDataId),
        configGroup: requiredString('configGroup', options.configGroup),
        registerEnabled: booleanOption('registerEnabled', options.registerEnabled),
        registerRequired: booleanOption('registerRequired', options.registerRequired),
        serviceName: requiredString('serviceName', options.serviceName),
        discoveryGroup: requiredString('discoveryGroup', options.discoveryGroup),
        registerIp: optionalString(options.registerIp),
        registerPort: positiveInteger('registerPort', options.registerPort, 65535)
    }
}

@Injectable()
export class NacosService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(NacosService.name)
    private readonly remoteConfigKeys = new Set<string>()
    private currentContent: string | null = null
    private loadPromise: Promise<void> | null = null
    private subscribed = false
    private configClient?: NacosConfigClient
    private configListener?: (content: string) => void
    private namingClient?: ClosableNacosNamingClient
    private registeredInstance?: RegisteredInstance
    private readonly options: NacosRuntimeOptions

    constructor(
        private readonly configService: ConfigService,
        @Inject(NACOS_RUNTIME_OPTIONS) options: NacosRuntimeOptions
    ) {
        this.options = normalizeOptions(options)
    }

    async onModuleInit(): Promise<void> {
        await this.loadConfig()
        await this.registerService()
    }

    async onModuleDestroy(): Promise<void> {
        if (this.configClient && this.configListener) {
            this.configClient.unSubscribe(this.getConfigSubscription(), this.configListener)
        }
        if (!this.namingClient) {
            this.configClient?.close()
            return
        }
        if (this.registeredInstance) {
            try {
                await this.namingClient.deregisterInstance(
                    this.getServiceName(),
                    { instanceId: '', healthy: true, enabled: true, ephemeral: true, ...this.registeredInstance },
                    this.getDiscoveryGroup()
                )
            } catch (error) {
                this.logger.warn(`注销 Nacos 服务实例失败：${this.getErrorMessage(error)}`)
            }
        }
        await this.namingClient.close()
        this.configClient?.close()
    }

    async loadConfig(): Promise<void> {
        if (!this.loadPromise) {
            this.loadPromise = this.initializeConfig().catch(error => {
                this.loadPromise = null
                throw error
            })
        }
        await this.loadPromise
    }

    private async initializeConfig(): Promise<void> {
        const { dataId, group } = this.getConfigSubscription()
        const namespace = this.options.namespace
        this.configClient = new NacosConfigClient({
            serverAddr: this.options.serverAddr,
            namespace,
            username: this.options.username,
            password: this.options.password,
            requestTimeout: this.options.requestTimeout
        })
        const content = await this.configClient.getConfig(dataId, group)
        this.applyRemoteConfig(content, '已加载', dataId, group, namespace)

        if (!this.subscribed) {
            this.configListener = nextContent => {
                try {
                    this.applyRemoteConfig(nextContent, '已更新', dataId, group, namespace)
                } catch (error) {
                    this.logger.error(`无效的 Nacos 配置更新已被拒绝：${this.getErrorMessage(error)}`)
                }
            }
            this.configClient.subscribe({ dataId, group }, this.configListener)
            this.subscribed = true
        }
    }

    private applyRemoteConfig(content: string, action: '已加载' | '已更新', dataId: string, group: string, namespace: string): void {
        if (!content?.trim()) {
            throw new Error(`Nacos 配置为空或不存在：dataId=${dataId}, group=${group}, namespace=${namespace}`)
        }
        if (content === this.currentContent) {
            return
        }

        const parsed = yaml.load(content)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Nacos 配置根节点必须是 YAML 对象')
        }

        const config = parsed as Record<string, unknown>
        const appliedKeys: string[] = []
        const environmentOverrideKeys: string[] = []
        for (const key of this.remoteConfigKeys) {
            if (!(key in config)) {
                this.configService.set(key, undefined)
            }
        }
        for (const [key, value] of Object.entries(config)) {
            if (Object.prototype.hasOwnProperty.call(process.env, key)) {
                environmentOverrideKeys.push(key)
                continue
            }
            this.configService.set(key, value)
            appliedKeys.push(key)
        }

        this.remoteConfigKeys.clear()
        appliedKeys.forEach(key => this.remoteConfigKeys.add(key))
        this.currentContent = content
        this.logger.log(
            `Nacos 配置${action}：dataId=${dataId}, group=${group}, namespace=${namespace}, ` +
                `已应用=${appliedKeys.join(',') || '无'}, 环境变量优先=${environmentOverrideKeys.join(',') || '无'}`
        )
    }

    private async registerService(): Promise<void> {
        if (!this.options.registerEnabled) {
            this.logger.warn('Nacos 服务注册已关闭')
            return
        }
        try {
            this.namingClient = new NacosNamingClient({
                logger: this.createNacosClientLogger(),
                serverList: this.options.serverAddr,
                namespace: this.options.namespace,
                username: this.options.username,
                password: this.options.password
            }) as ClosableNacosNamingClient
            await this.namingClient.ready()

            const instance = { ip: this.resolveRegisterIp(), port: this.getRegisterPort() }
            await this.namingClient.registerInstance(
                this.getServiceName(),
                { instanceId: '', healthy: true, enabled: true, ephemeral: true, ...instance },
                this.getDiscoveryGroup()
            )
            this.registeredInstance = instance
            this.logger.log(`服务已注册到 Nacos：${this.getServiceName()} ${instance.ip}:${instance.port}`)
        } catch (error) {
            this.logger.error(`注册 Nacos 服务实例失败：${this.getErrorMessage(error)}`)
            if (this.options.registerRequired) {
                throw error
            }
        }
    }

    private resolveRegisterIp(): string {
        if (this.options.registerIp) {
            return this.options.registerIp
        }
        for (const addresses of Object.values(networkInterfaces())) {
            const address = addresses?.find(item => item.family === 'IPv4' && !item.internal)
            if (address) {
                return address.address
            }
        }
        return '127.0.0.1'
    }

    private getRegisterPort(): number {
        return this.options.registerPort
    }

    private getDiscoveryGroup(): string {
        return this.options.discoveryGroup
    }

    private getConfigSubscription(): { dataId: string; group: string } {
        return {
            dataId: this.options.configDataId,
            group: this.options.configGroup
        }
    }

    private getServiceName(): string {
        return this.options.serviceName
    }

    private createNacosClientLogger(): typeof console {
        const clientLogger = Object.create(console) as typeof console
        clientLogger.log = () => undefined
        clientLogger.info = () => undefined
        clientLogger.debug = () => undefined
        return clientLogger
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error)
    }
}
