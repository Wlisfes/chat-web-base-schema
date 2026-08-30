import { networkInterfaces } from 'node:os'
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NacosConfigClient, NacosNamingClient } from 'nacos'
import type { Host } from 'nacos'
import { NACOS_RUNTIME_OPTIONS, NacosInstanceListener, NacosRuntimeOptions, NacosRuntimeStatus } from './nacos.interface'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const yaml = require('js-yaml')

type RegisteredInstance = {
    ip: string
    port: number
    weight: number
}

type ClosableNacosNamingClient = NacosNamingClient & {
    /** nacos-naming 2.x exposes the lifecycle method as `_close()`. */
    _close?: () => Promise<void>
    /** Keep compatibility with wrappers that expose the public `close()`. */
    close?: () => Promise<void>
}

const MAX_NACOS_WEIGHT = 10_000

type ResolvedNacosRuntimeOptions = Required<Omit<NacosRuntimeOptions, 'username' | 'password' | 'registerIp'>> &
    Pick<NacosRuntimeOptions, 'username' | 'password' | 'registerIp'>

function requiredString(property: string, value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`NacosRuntimeOptions.${property} 必须是非空字符串`)
    }
    return value.trim()
}

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function stringOption(property: string, value: unknown, fallback: string): string {
    return value === undefined ? fallback : requiredString(property, value)
}

function positiveInteger(property: string, value: unknown, maximum = Number.MAX_SAFE_INTEGER): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > maximum) {
        throw new Error(`NacosRuntimeOptions.${property} 必须是 1-${maximum} 之间的整数`)
    }
    return value
}

function positiveIntegerOption(property: string, value: unknown, fallback: number): number {
    return value === undefined ? fallback : positiveInteger(property, value)
}

function positiveNumber(property: string, value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > MAX_NACOS_WEIGHT) {
        throw new Error(`NacosRuntimeOptions.${property} 必须是大于 0 且不超过 ${MAX_NACOS_WEIGHT} 的有限数值`)
    }
    return value
}

function positiveNumberOption(property: string, value: unknown, fallback: number): number {
    return value === undefined ? fallback : positiveNumber(property, value)
}

function booleanOption(property: string, value: unknown, fallback: boolean): boolean {
    if (value === undefined) {
        return fallback
    }
    if (typeof value !== 'boolean') {
        throw new Error(`NacosRuntimeOptions.${property} 必须是布尔值`)
    }
    return value
}

function normalizeOptions(options: NacosRuntimeOptions): ResolvedNacosRuntimeOptions {
    if (!options || typeof options !== 'object') {
        throw new Error('NacosRuntimeOptions 必须是对象')
    }
    const serviceName = requiredString('serviceName', options.serviceName)
    const configGroup = stringOption('configGroup', options.configGroup, 'DEFAULT_GROUP')
    const registerEnabled = booleanOption('registerEnabled', options.registerEnabled, true)
    return {
        serverAddr: requiredString('serverAddr', options.serverAddr),
        namespace: requiredString('namespace', options.namespace),
        username: optionalString(options.username),
        password: optionalString(options.password),
        requestTimeout: positiveIntegerOption('requestTimeout', options.requestTimeout, 5000),
        configDataId: stringOption('configDataId', options.configDataId, `${serviceName}.yaml`),
        configGroup,
        registerEnabled,
        discoveryEnabled: booleanOption('discoveryEnabled', options.discoveryEnabled, registerEnabled),
        discoveryRequired: booleanOption('discoveryRequired', options.discoveryRequired, false),
        configEnabled: booleanOption('configEnabled', options.configEnabled, true),
        configRequired: booleanOption('configRequired', options.configRequired, true),
        registerRequired: booleanOption('registerRequired', options.registerRequired, false),
        serviceName,
        discoveryGroup: stringOption('discoveryGroup', options.discoveryGroup, configGroup),
        registerIp: optionalString(options.registerIp),
        registerPort: positiveInteger('registerPort', options.registerPort, 65535),
        registerWeight: positiveNumberOption('registerWeight', options.registerWeight, 1)
    }
}

@Injectable()
export class NacosService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(NacosService.name)
    private readonly remoteConfigKeys = new Set<string>()
    private readonly configListeners = new Set<() => void>()
    private readonly hosts = new Map<string, Host[]>()
    private readonly namingListeners = new Map<string, NacosInstanceListener>()
    private readonly serviceListeners = new Map<string, Set<NacosInstanceListener>>()
    private readonly weightedState = new Map<string, Map<string, number>>()
    private readonly subscriptionPromises = new Map<string, Promise<void>>()
    private currentContent: string | null = null
    private loadPromise: Promise<void> | null = null
    private subscribed = false
    private configClient?: NacosConfigClient
    private configListener?: (content: string) => void
    private namingClient?: ClosableNacosNamingClient
    private namingClientPromise?: Promise<ClosableNacosNamingClient>
    private registrationPromise?: Promise<void>
    private registeredInstance?: RegisteredInstance
    private configLoaded = false
    private connected = false
    private registered = false
    private configError?: string
    private discoveryError?: string
    private readonly options: ResolvedNacosRuntimeOptions

    constructor(
        private readonly configService: ConfigService,
        @Inject(NACOS_RUNTIME_OPTIONS) options: NacosRuntimeOptions
    ) {
        this.options = normalizeOptions(options)
    }

    async onModuleInit(): Promise<void> {
        if (this.options.configEnabled) {
            try {
                await this.loadConfig()
            } catch (error) {
                this.configError = this.getErrorMessage(error)
                this.logger.error(`加载 Nacos 配置失败：${this.getErrorMessage(error)}`)
                if (this.options.configRequired) throw error
            }
        }
        if (!this.options.discoveryEnabled && !this.options.registerEnabled) {
            return
        }

        try {
            await this.ensureNamingClient()
        } catch (error) {
            this.discoveryError = this.getErrorMessage(error)
            this.logger.error(`连接 Nacos 服务发现失败：${this.discoveryError}`)
            if (this.options.discoveryRequired || (this.options.registerEnabled && this.options.registerRequired)) {
                throw error
            }
            return
        }

        if (this.options.registerEnabled) {
            await this.registerService()
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.configClient && this.configListener) {
            this.configClient.unSubscribe(this.getConfigSubscription(), this.configListener)
        }
        if (this.namingClient) {
            for (const [serviceName, listeners] of this.serviceListeners) {
                for (const listener of listeners) {
                    this.unsubscribeNamingListener(serviceName, listener)
                }
            }
            this.serviceListeners.clear()
            this.namingListeners.clear()
            this.hosts.clear()
            this.weightedState.clear()
        }
        let namingClient = this.namingClient
        if (!namingClient && this.namingClientPromise) {
            try {
                namingClient = await this.namingClientPromise
            } catch {
                // The client failed during startup; there is no resource to close.
            }
        }
        this.configListeners.clear()
        if (!namingClient) {
            this.configClient?.close()
            this.configListeners.clear()
            return
        }
        if (this.registeredInstance) {
            try {
                await namingClient.deregisterInstance(
                    this.getServiceName(),
                    { instanceId: '', healthy: true, enabled: true, ephemeral: true, ...this.registeredInstance },
                    this.getDiscoveryGroup()
                )
            } catch (error) {
                this.logger.warn(`注销 Nacos 服务实例失败：${this.getErrorMessage(error)}`)
            }
        }
        await this.closeNamingClient(namingClient)
        this.connected = false
        this.namingClient = undefined
        this.namingClientPromise = undefined
        this.configClient?.close()
        this.configListeners.clear()
    }

    async loadConfig(): Promise<void> {
        if (!this.options.configEnabled) {
            return
        }
        if (!this.loadPromise) {
            this.loadPromise = this.initializeConfig().catch(error => {
                this.loadPromise = null
                throw error
            })
        }
        await this.loadPromise
    }

    /** 返回共享 Nacos 运行状态，供网关健康检查等基础设施使用。 */
    getStatus(): NacosRuntimeStatus {
        return {
            configEnabled: this.options.configEnabled,
            configLoaded: this.configLoaded,
            discoveryEnabled: this.options.discoveryEnabled,
            connected: this.connected,
            registered: this.registered,
            ...(this.configError ? { configError: this.configError } : {}),
            ...(this.discoveryError ? { discoveryError: this.discoveryError } : {})
        }
    }

    /** 订阅配置变更；返回取消订阅函数。 */
    onConfigChange(listener: () => void): () => void {
        this.configListeners.add(listener)
        return () => this.configListeners.delete(listener)
    }

    /** 查询服务实例。共享 Nacos 客户端由本服务统一维护。 */
    async getAllInstances(serviceName: string, subscribe = true): Promise<Host[]> {
        if (!serviceName?.trim()) {
            throw new Error('Nacos 服务名称不能为空')
        }
        if (!this.options.discoveryEnabled) {
            return []
        }
        const client = await this.ensureNamingClient()
        return client.getAllInstances(serviceName, this.getDiscoveryGroup(), '', subscribe)
    }

    /** 按实例权重平滑选择健康实例；无可用实例时返回后备地址。 */
    async resolveService(serviceName: string, fallbackUrl: string): Promise<string> {
        if (!this.options.discoveryEnabled || !this.connected) {
            return fallbackUrl
        }
        try {
            await this.ensureServiceSubscription(serviceName)
            const hosts = this.hosts.get(serviceName) ?? []
            const healthy = hosts.filter(host => host.healthy && host.enabled && this.getInstanceWeight(host.weight) > 0)
            const selected = this.selectWeighted(serviceName, healthy)
            if (selected) {
                const protocol = selected.metadata?.protocol === 'https' ? 'https' : 'http'
                const hostname = selected.ip.includes(':') ? `[${selected.ip}]` : selected.ip
                return `${protocol}://${hostname}:${selected.port}`
            }
        } catch (error) {
            this.logger.warn(`查询服务 ${serviceName} 失败，使用后备地址：${this.getErrorMessage(error)}`)
        }
        return fallbackUrl
    }

    /** 为网关预热并订阅路由对应的服务实例。 */
    async refreshSubscriptions(serviceNames: string[]): Promise<void> {
        if (!this.options.discoveryEnabled || !this.connected) {
            return
        }
        try {
            const expected = new Set(serviceNames)
            for (const [serviceName, listener] of this.namingListeners) {
                if (expected.has(serviceName)) continue
                this.unsubscribeService(serviceName, listener)
                this.namingListeners.delete(serviceName)
                this.hosts.delete(serviceName)
                this.weightedState.delete(serviceName)
            }
            for (const serviceName of expected) {
                await this.ensureServiceSubscription(serviceName)
            }
        } catch (error) {
            this.discoveryError = this.getErrorMessage(error)
            if (this.options.discoveryRequired) {
                throw error
            }
            return
        }
        this.discoveryError = undefined
    }

    /** 返回指定服务当前健康实例数量。 */
    getHealthyInstanceCount(serviceName: string): number {
        return (this.hosts.get(serviceName) ?? []).filter(host => host.healthy && host.enabled && this.getInstanceWeight(host.weight) > 0)
            .length
    }

    /** 订阅服务实例变更。 */
    async subscribeService(serviceName: string, listener: NacosInstanceListener): Promise<void> {
        if (!serviceName?.trim()) {
            throw new Error('Nacos 服务名称不能为空')
        }
        if (!this.options.discoveryEnabled) {
            return
        }
        const client = await this.ensureNamingClient()
        client.subscribe({ serviceName, groupName: this.getDiscoveryGroup() }, listener)
        const listeners = this.serviceListeners.get(serviceName) ?? new Set<NacosInstanceListener>()
        listeners.add(listener)
        this.serviceListeners.set(serviceName, listeners)
    }

    /** 取消服务实例订阅。 */
    unsubscribeService(serviceName: string, listener: NacosInstanceListener): void {
        this.unsubscribeNamingListener(serviceName, listener)
        const listeners = this.serviceListeners.get(serviceName)
        listeners?.delete(listener)
        if (listeners?.size === 0) {
            this.serviceListeners.delete(serviceName)
        }
    }

    private setHosts(serviceName: string, hosts: Host[]): void {
        this.hosts.set(serviceName, hosts)
        const known = new Set(hosts.map(host => this.getInstanceKey(host)))
        const state = this.weightedState.get(serviceName)
        if (state) for (const key of state.keys()) if (!known.has(key)) state.delete(key)
    }

    private async ensureServiceSubscription(serviceName: string): Promise<void> {
        if (this.namingListeners.has(serviceName)) {
            return
        }
        const current = this.subscriptionPromises.get(serviceName)
        if (current) {
            await current
            return
        }
        const promise = this.initializeServiceSubscription(serviceName)
        this.subscriptionPromises.set(serviceName, promise)
        try {
            await promise
        } finally {
            this.subscriptionPromises.delete(serviceName)
        }
    }

    private async initializeServiceSubscription(serviceName: string): Promise<void> {
        // Fetch directly, then attach one explicit listener. This avoids the SDK's
        // implicit cache subscription being created before our listener is known.
        const hosts = await this.getAllInstances(serviceName, false)
        this.setHosts(serviceName, hosts)
        const listener: NacosInstanceListener = nextHosts => this.setHosts(serviceName, nextHosts)
        await this.subscribeService(serviceName, listener)
        this.namingListeners.set(serviceName, listener)
    }

    private selectWeighted(serviceName: string, hosts: Host[]): Host | undefined {
        if (hosts.length === 0) return undefined
        const state = this.weightedState.get(serviceName) ?? new Map<string, number>()
        this.weightedState.set(serviceName, state)
        let selected: Host | undefined
        let selectedKey = ''
        let selectedCurrent = Number.NEGATIVE_INFINITY
        let total = 0
        for (const host of hosts) {
            const key = this.getInstanceKey(host)
            const weight = this.getInstanceWeight(host.weight)
            const current = (state.get(key) ?? 0) + weight
            state.set(key, current)
            total += weight
            if (current > selectedCurrent) {
                selected = host
                selectedKey = key
                selectedCurrent = current
            }
        }
        if (selected) state.set(selectedKey, (state.get(selectedKey) ?? 0) - total)
        return selected
    }

    private getInstanceWeight(weight: unknown): number {
        if (weight === undefined || weight === null || weight === '') {
            return 1
        }
        const value = Number(weight)
        return Number.isFinite(value) && value >= 0 ? value : 0
    }

    private getInstanceKey(host: Host): string {
        return host.instanceId || `${host.ip}:${host.port}`
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
        this.configLoaded = true

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
        this.configError = undefined
        this.logger.log(
            `Nacos 配置${action}：dataId=${dataId}, group=${group}, namespace=${namespace}, ` +
                `已应用=${appliedKeys.join(',') || '无'}, 环境变量优先=${environmentOverrideKeys.join(',') || '无'}`
        )
        this.configListeners.forEach(listener => {
            try {
                listener()
            } catch (error) {
                this.logger.warn(`Nacos 配置变更监听器执行失败：${this.getErrorMessage(error)}`)
            }
        })
    }

    private async registerService(): Promise<void> {
        if (!this.options.registerEnabled) {
            this.logger.warn('Nacos 服务注册已关闭')
            return
        }
        if (this.registered) {
            return
        }
        if (this.registrationPromise) {
            await this.registrationPromise
            return
        }
        this.registrationPromise = this.registerServiceInternal()
        try {
            await this.registrationPromise
        } finally {
            this.registrationPromise = undefined
        }
    }

    private async registerServiceInternal(): Promise<void> {
        try {
            const namingClient = await this.ensureNamingClient()
            const instance = { ip: this.resolveRegisterIp(), port: this.getRegisterPort(), weight: this.getRegisterWeight() }
            await namingClient.registerInstance(
                this.getServiceName(),
                { instanceId: '', healthy: true, enabled: true, ephemeral: true, ...instance },
                this.getDiscoveryGroup()
            )
            this.registeredInstance = instance
            this.registered = true
            this.discoveryError = undefined
            this.logger.log(`服务已注册到 Nacos：${this.getServiceName()} ${instance.ip}:${instance.port}，权重=${instance.weight}`)
        } catch (error) {
            this.discoveryError = this.getErrorMessage(error)
            this.logger.error(`注册 Nacos 服务实例失败：${this.getErrorMessage(error)}`)
            if (this.options.registerRequired) {
                throw error
            }
        }
    }

    private unsubscribeNamingListener(serviceName: string, listener: NacosInstanceListener): void {
        this.namingClient?.unSubscribe({ serviceName, groupName: this.getDiscoveryGroup() }, listener)
    }

    private async closeNamingClient(client: ClosableNacosNamingClient): Promise<void> {
        const close = client.close ?? client._close
        if (close) {
            await close.call(client)
        }
    }

    private async ensureNamingClient(): Promise<ClosableNacosNamingClient> {
        if (this.namingClient) {
            return this.namingClient
        }
        if (!this.namingClientPromise) {
            this.namingClientPromise = (async () => {
                const client = new NacosNamingClient({
                    logger: this.createNacosClientLogger(),
                    serverList: this.options.serverAddr,
                    namespace: this.options.namespace,
                    username: this.options.username,
                    password: this.options.password
                }) as ClosableNacosNamingClient
                try {
                    await client.ready()
                    this.namingClient = client
                    this.connected = true
                    this.discoveryError = undefined
                    return client
                } catch (error) {
                    this.connected = false
                    throw error
                }
            })().catch(error => {
                this.namingClientPromise = undefined
                throw error
            })
        }
        return this.namingClientPromise
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

    private getRegisterWeight(): number {
        return this.options.registerWeight
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
