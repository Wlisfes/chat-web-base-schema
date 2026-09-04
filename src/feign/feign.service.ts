import {
    BadGatewayException,
    Inject,
    Injectable,
    OnApplicationBootstrap,
    ServiceUnavailableException,
    UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getActiveRequestId } from '@/utils/modules/request-context'
import { FEIGN_FETCH } from './feign.constants'
import { getFeignClientOptions, getFeignMethodDefinitions } from './feign.decorator'
import type * as FeignTypes from './feign.interface'

/** 根据客户端和方法装饰器元数据创建 Feign HTTP 代理。 */
@Injectable()
export class FeignClientFactory implements OnApplicationBootstrap {
    private readonly registeredClientOptions = new Map<string, FeignTypes.FeignClientOptions>()

    /** 注入运行时配置和可替换的 HTTP 请求函数。 */
    constructor(
        private readonly configService: ConfigService,
        @Inject(FEIGN_FETCH) private readonly fetchClient: FeignTypes.FeignFetch
    ) {}

    /** 创建指定客户端的代理实例，并校验客户端和方法定义。 */
    create<TClient extends object>(client: FeignTypes.FeignClientConstructor<TClient>): TClient {
        const options = this.validateClientOptions(getFeignClientOptions(client), client.name)
        const methods = getFeignMethodDefinitions(client)
        if (!methods.size) throw new Error(`Feign 客户端 ${client.name} 没有声明接口方法`)
        this.registeredClientOptions.set(client.name, options)
        const implementations = new Map<string | symbol, (...args: unknown[]) => Promise<unknown>>()
        for (const [propertyKey, definition] of methods) {
            const validated = this.validateMethodDefinition(client.name, propertyKey, definition)
            implementations.set(propertyKey, (...args: unknown[]) => this.invoke(options, validated, args))
        }
        return new Proxy(Object.create(client.prototype) as TClient, {
            get: (target, propertyKey, receiver) => implementations.get(propertyKey) ?? Reflect.get(target, propertyKey, receiver)
        })
    }

    /** Nacos 加载完成后校验全部已注册客户端，缺少地址或超时时阻止应用启动。 */
    onApplicationBootstrap(): void {
        for (const options of this.registeredClientOptions.values()) {
            this.getBaseUrl(options)
            this.getTimeout(options)
        }
    }

    /** 组装请求、执行远程调用并统一解析服务响应。 */
    private async invoke(
        options: FeignTypes.FeignClientOptions,
        definition: FeignTypes.FeignMethodDefinition,
        args: unknown[]
    ): Promise<unknown> {
        const url = new URL(definition.path, this.getBaseUrl(options))
        // 所有请求默认接受统一 JSON 响应，并沿用当前请求的追踪 ID。
        const headers = new Headers({ accept: 'application/json' })
        const requestId = getActiveRequestId()
        if (requestId) headers.set('x-request-id', requestId)
        let body: unknown
        // 根据参数装饰器将方法入参绑定到查询字符串、请求头或请求体。
        for (const parameter of definition.parameters) {
            const value = args[parameter.index]
            if (parameter.kind === 'query') this.appendQuery(url, parameter, value)
            if (parameter.kind === 'header') this.appendHeader(headers, parameter, value)
            if (parameter.kind === 'body') body = value
        }
        const init: RequestInit = {
            method: definition.method,
            headers,
            signal: AbortSignal.timeout(this.getTimeout(options))
        }
        // 只有 POST 且声明了请求体时才序列化 JSON，GET 请求不会携带 Body。
        if (definition.method === 'POST' && body !== undefined) {
            headers.set('content-type', 'application/json')
            init.body = JSON.stringify(body)
        }

        let response: Response
        try {
            response = await this.fetchClient(url, init)
        } catch {
            // 网络错误、连接失败和超时统一转换为上游服务不可用。
            throw new ServiceUnavailableException(`${options.name}暂不可用`)
        }
        let envelope: FeignTypes.FeignApiEnvelope
        try {
            envelope = (await response.json()) as FeignTypes.FeignApiEnvelope
        } catch {
            // 上游返回非 JSON 内容时无法按统一协议解析。
            throw new BadGatewayException(`${options.name}返回了无效响应`)
        }
        const code = typeof envelope.code === 'number' ? envelope.code : response.status
        const message = typeof envelope.message === 'string' && envelope.message.trim() ? envelope.message : `${options.name}返回异常`
        if (response.status === 401 || response.status === 403 || code === 401 || code === 403) {
            throw new UnauthorizedException(message)
        }
        // HTTP 状态码和业务响应码都必须表示成功，否则视为上游网关错误。
        if (!response.ok || code !== 200) throw new BadGatewayException(message)
        return envelope.data
    }

    /** 将查询参数追加到 URL；数组参数会重复追加同名键。 */
    private appendQuery(url: URL, parameter: FeignTypes.FeignParameterOptions, value: unknown): void {
        if (value === undefined || value === null || value === '') return
        const name = parameter.name
        if (!name) throw new Error('Feign Query 参数必须声明名称')
        const values = Array.isArray(value) ? value : [value]
        for (const item of values) {
            if (!['string', 'number', 'boolean'].includes(typeof item)) throw new Error(`Feign Query 参数 ${name} 类型无效`)
            url.searchParams.append(name, String(item))
        }
    }

    /** 写入请求头并校验 Authorization 的 Bearer 格式。 */
    private appendHeader(headers: Headers, parameter: FeignTypes.FeignParameterOptions, value: unknown): void {
        const name = parameter.name?.trim()
        if (!name) throw new Error('Feign Header 参数必须声明名称')
        if (typeof value !== 'string' || !value.trim()) {
            if (name.toLowerCase() === 'authorization') throw new UnauthorizedException('缺少 Bearer 访问令牌')
            throw new Error(`Feign Header 参数 ${name} 不能为空`)
        }
        if (name.toLowerCase() === 'authorization' && !/^Bearer\s+\S+$/i.test(value)) {
            throw new UnauthorizedException('Bearer 访问令牌格式错误')
        }
        headers.set(name, value)
    }

    /** 读取并校验客户端服务地址。 */
    private getBaseUrl(options: FeignTypes.FeignClientOptions): URL {
        const configured = this.configService.get<unknown>(options.baseUrlConfigKey)
        if (typeof configured !== 'string' || !configured.trim()) {
            throw new Error(`Nacos 配置 ${options.baseUrlConfigKey} 必须是非空字符串`)
        }
        let url: URL
        try {
            url = new URL(configured.trim())
        } catch {
            throw new Error(`${options.baseUrlConfigKey} 格式无效`)
        }
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${options.baseUrlConfigKey} 必须使用 http:// 或 https://`)
        return url
    }

    /** 读取并校验请求超时时间。 */
    private getTimeout(options: FeignTypes.FeignClientOptions): number {
        const key = options.timeoutConfigKey
        const configured = this.configService.get<unknown>(key)
        if (configured === undefined || configured === null || configured === '') {
            throw new Error(`Nacos 配置 ${key} 必须配置`)
        }
        const value = Number(configured)
        if (!Number.isInteger(value) || value < 100 || value > 30_000) {
            throw new Error(`${key || `${options.name} timeout`} 必须是 100-30000 之间的整数`)
        }
        return value
    }

    /** 校验客户端级元数据是否完整。 */
    private validateClientOptions(options: FeignTypes.FeignClientOptions | undefined, clientName: string): FeignTypes.FeignClientOptions {
        if (!options) throw new Error(`Feign 客户端 ${clientName} 缺少 @FeignClient 声明`)
        if (!options.name.trim()) throw new Error(`Feign 客户端 ${clientName} 的服务名称不能为空`)
        if (!options.baseUrlConfigKey.trim()) throw new Error(`Feign 客户端 ${clientName} 的 URL 配置键不能为空`)
        if (!options.timeoutConfigKey.trim()) throw new Error(`Feign 客户端 ${clientName} 的超时配置键不能为空`)
        return options
    }

    /** 校验方法路径、请求体数量和参数定义是否符合运行时约束。 */
    private validateMethodDefinition(
        clientName: string,
        propertyKey: string | symbol,
        definition: FeignTypes.FeignMethodDefinition
    ): FeignTypes.FeignMethodDefinition {
        if (!definition.path.startsWith('/')) throw new Error(`Feign 接口 ${clientName}.${String(propertyKey)} 的路径必须以 / 开头`)
        const bodyCount = definition.parameters.filter(parameter => parameter.kind === 'body').length
        if (bodyCount > 1) throw new Error(`Feign 接口 ${clientName}.${String(propertyKey)} 只能声明一个 Body`)
        if (definition.method === 'GET' && bodyCount) throw new Error(`Feign GET 接口 ${clientName}.${String(propertyKey)} 不能声明 Body`)
        return { ...definition, parameters: [...definition.parameters].sort((left, right) => left.index - right.index) }
    }
}
