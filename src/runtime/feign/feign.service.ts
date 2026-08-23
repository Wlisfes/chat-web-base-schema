import { BadGatewayException, Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FEIGN_FETCH } from './feign.constants'
import { getFeignClientOptions, getFeignMethodDefinitions } from './feign.decorator'
import type {
    FeignApiEnvelope,
    FeignClientConstructor,
    FeignClientOptions,
    FeignFetch,
    FeignMethodDefinition,
    FeignParameterOptions
} from './feign.interface'

@Injectable()
export class FeignClientFactory {
    constructor(
        private readonly configService: ConfigService,
        @Inject(FEIGN_FETCH) private readonly fetchClient: FeignFetch
    ) {}

    create<TClient extends object>(client: FeignClientConstructor<TClient>): TClient {
        const options = this.validateClientOptions(getFeignClientOptions(client), client.name)
        const methods = getFeignMethodDefinitions(client)
        if (!methods.size) throw new Error(`Feign 客户端 ${client.name} 没有声明接口方法`)
        const implementations = new Map<string | symbol, (...args: unknown[]) => Promise<unknown>>()
        for (const [propertyKey, definition] of methods) {
            const validated = this.validateMethodDefinition(client.name, propertyKey, definition)
            implementations.set(propertyKey, (...args: unknown[]) => this.invoke(options, validated, args))
        }
        return new Proxy(Object.create(client.prototype) as TClient, {
            get: (target, propertyKey, receiver) => implementations.get(propertyKey) ?? Reflect.get(target, propertyKey, receiver)
        })
    }

    private async invoke(options: FeignClientOptions, definition: FeignMethodDefinition, args: unknown[]): Promise<unknown> {
        const url = new URL(definition.path, this.getBaseUrl(options))
        const headers = new Headers({ accept: 'application/json' })
        let body: unknown
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
        if (definition.method === 'POST' && body !== undefined) {
            headers.set('content-type', 'application/json')
            init.body = JSON.stringify(body)
        }

        let response: Response
        try {
            response = await this.fetchClient(url, init)
        } catch {
            throw new ServiceUnavailableException(`${options.name}暂不可用`)
        }
        let envelope: FeignApiEnvelope
        try {
            envelope = (await response.json()) as FeignApiEnvelope
        } catch {
            throw new BadGatewayException(`${options.name}返回了无效响应`)
        }
        const code = typeof envelope.code === 'number' ? envelope.code : response.status
        const message = typeof envelope.message === 'string' && envelope.message.trim() ? envelope.message : `${options.name}返回异常`
        if (response.status === 401 || response.status === 403 || code === 401 || code === 403) {
            throw new UnauthorizedException(message)
        }
        if (!response.ok || code !== 200) throw new BadGatewayException(message)
        return envelope.data
    }

    private appendQuery(url: URL, parameter: FeignParameterOptions, value: unknown): void {
        if (value === undefined || value === null || value === '') return
        const name = parameter.name
        if (!name) throw new Error('Feign Query 参数必须声明名称')
        const values = Array.isArray(value) ? value : [value]
        for (const item of values) {
            if (!['string', 'number', 'boolean'].includes(typeof item)) throw new Error(`Feign Query 参数 ${name} 类型无效`)
            url.searchParams.append(name, String(item))
        }
    }

    private appendHeader(headers: Headers, parameter: FeignParameterOptions, value: unknown): void {
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

    private getBaseUrl(options: FeignClientOptions): URL {
        const configured = this.configService.get<string>(options.baseUrlConfigKey)?.trim() || options.defaultBaseUrl
        let url: URL
        try {
            url = new URL(configured)
        } catch {
            throw new Error(`${options.baseUrlConfigKey} 格式无效`)
        }
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${options.baseUrlConfigKey} 必须使用 http:// 或 https://`)
        return url
    }

    private getTimeout(options: FeignClientOptions): number {
        const key = options.timeoutConfigKey
        const configured = key ? this.configService.get<string | number>(key) : undefined
        const value = configured === undefined || configured === '' ? (options.defaultTimeoutMs ?? 3000) : Number(configured)
        if (!Number.isInteger(value) || value < 100 || value > 30_000) {
            throw new Error(`${key || `${options.name} timeout`} 必须是 100-30000 之间的整数`)
        }
        return value
    }

    private validateClientOptions(options: FeignClientOptions | undefined, clientName: string): FeignClientOptions {
        if (!options) throw new Error(`Feign 客户端 ${clientName} 缺少 @FeignClient 声明`)
        if (!options.name.trim()) throw new Error(`Feign 客户端 ${clientName} 的服务名称不能为空`)
        if (!options.baseUrlConfigKey.trim()) throw new Error(`Feign 客户端 ${clientName} 的 URL 配置键不能为空`)
        return options
    }

    private validateMethodDefinition(
        clientName: string,
        propertyKey: string | symbol,
        definition: FeignMethodDefinition
    ): FeignMethodDefinition {
        if (!definition.path.startsWith('/')) throw new Error(`Feign 接口 ${clientName}.${String(propertyKey)} 的路径必须以 / 开头`)
        const bodyCount = definition.parameters.filter(parameter => parameter.kind === 'body').length
        if (bodyCount > 1) throw new Error(`Feign 接口 ${clientName}.${String(propertyKey)} 只能声明一个 Body`)
        if (definition.method === 'GET' && bodyCount) throw new Error(`Feign GET 接口 ${clientName}.${String(propertyKey)} 不能声明 Body`)
        return { ...definition, parameters: [...definition.parameters].sort((left, right) => left.index - right.index) }
    }
}
