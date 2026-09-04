import { Body, Get, Headers, Post, Query, applyDecorators } from '@nestjs/common'
import { PATH_METADATA } from '@nestjs/common/constants'
import { Public } from '../runtime/auth/auth.decorator'
import { ApiServiceDecorator } from '../decorator/api-service.decorator'
import { PreserveHttpStatus } from '../filters/modules/preserve-http-status.decorator'
import type { ApiServiceDecoratorOptions } from '../decorator/api-service.decorator'
import type * as FeignTypes from './feign.interface'

/** 按客户端构造函数保存服务级配置，使用 WeakMap 避免影响客户端生命周期。 */
const clientDefinitions = new WeakMap<Function, FeignTypes.FeignClientOptions>()
/** 按客户端原型保存方法级请求定义和参数绑定元数据。 */
const methodDefinitions = new WeakMap<object, Map<string | symbol, FeignTypes.FeignMethodDefinition>>()

/** 获取或初始化某个 Feign 方法的元数据对象。 */
function methodDefinition(target: object, propertyKey: string | symbol): FeignTypes.FeignMethodDefinition {
    let definitions = methodDefinitions.get(target)
    if (!definitions) {
        definitions = new Map()
        methodDefinitions.set(target, definitions)
    }
    let definition = definitions.get(propertyKey)
    if (!definition) {
        definition = { method: 'GET', path: '', parameters: [] }
        definitions.set(propertyKey, definition)
    }
    return definition
}

/** 记录 HTTP 方法和服务端相对路径，并将同一声明同步为 Nest 路由。 */
function request(method: FeignTypes.FeignHttpMethod, path: string, api?: ApiServiceDecoratorOptions): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        const definition = methodDefinition(target, propertyKey)
        definition.method = method
        definition.path = path

        // Feign 方法声明本身也是服务端路由声明。客户端代理不会读取这些 Nest 元数据，
        // 但 Controller 继承客户端后可以直接复用路由、公开访问和统一响应处理规则。
        const route = method === 'GET' ? Get(path) : Post(path)
        const serverDecorator = api ? ApiServiceDecorator(route, api) : route
        applyDecorators(Public(), PreserveHttpStatus(), serverDecorator)(target, propertyKey, descriptor)
    }
}

/** 为方法参数记录 HTTP 请求位置和参数名称。 */
function parameter(kind: FeignTypes.FeignParameterKind, name?: string): ParameterDecorator {
    return (target, propertyKey, parameterIndex) => {
        if (propertyKey === undefined) throw new Error('Feign 参数装饰器只能用于方法')
        const definition = methodDefinition(target, propertyKey)
        definition.parameters = definition.parameters.filter(item => item.index !== parameterIndex)
        definition.parameters.push({ index: parameterIndex, kind, name })

        // 同一份参数绑定同时服务于 Feign 客户端请求组装和 Nest Controller 入参注入。
        if (kind === 'header') Headers(name)(target, propertyKey, parameterIndex)
        if (kind === 'query') (name ? Query(name) : Query())(target, propertyKey, parameterIndex)
        if (kind === 'body') Body()(target, propertyKey, parameterIndex)
    }
}

/** 声明 Feign 客户端的服务名称、路径前缀、地址配置键和超时配置。 */
export function FeignClient(options: FeignTypes.FeignClientOptions): ClassDecorator {
    return target => {
        const prefix = normalizeClientPrefix(options.prefix, target.name)
        const definitions = methodDefinitions.get(target.prototype)
        if (prefix && definitions) {
            for (const [propertyKey, definition] of definitions) {
                if (!definition.path.startsWith('/')) {
                    throw new Error(`Feign 接口 ${target.name}.${String(propertyKey)} 的路径必须以 / 开头`)
                }
                const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyKey)
                if (!descriptor?.value) throw new Error(`Feign 接口 ${target.name}.${String(propertyKey)} 缺少方法定义`)
                if (definition.path !== prefix && !definition.path.startsWith(`${prefix}/`)) definition.path = `${prefix}${definition.path}`
                // 方法装饰器已经写入了 Nest 的其他路由和 Swagger 元数据，这里只覆盖路径元数据，
                // 避免重新应用路由装饰器时丢失接口文档定义。
                Reflect.defineMetadata(PATH_METADATA, definition.path, descriptor.value)
            }
        }
        clientDefinitions.set(target, { ...options, prefix: prefix || undefined })
    }
}

/** 校验并规范化 Feign 客户端的公共路径前缀。 */
function normalizeClientPrefix(prefix: string | undefined, clientName: string): string {
    if (prefix === undefined) return ''
    const normalized = prefix.trim()
    if (!normalized) throw new Error(`Feign 客户端 ${clientName} 的路径前缀不能为空`)
    const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`
    if (withSlash.includes('?') || withSlash.includes('#')) throw new Error(`Feign 客户端 ${clientName} 的路径前缀不能包含查询参数或锚点`)
    return withSlash === '/' ? '' : withSlash.replace(/\/+$/, '')
}

/** 将方法声明为 GET 请求。 */
export function FeignGet(path: string, api?: ApiServiceDecoratorOptions): MethodDecorator {
    return request('GET', path, withDefaultBearerAuth(api))
}

/** 将方法声明为 POST 请求。 */
export function FeignPost(path: string, api?: ApiServiceDecoratorOptions): MethodDecorator {
    return request('POST', path, withDefaultBearerAuth(api))
}

/**
 * Feign 接口默认需要携带 Bearer Token。
 *
 * 这里只对 FeignGet/FeignPost 生效，不改变普通 ApiServiceDecorator 的默认行为；
 * 调用方仍可显式传入 bearerAuth: false 标记公开的 Feign 接口。
 */
function withDefaultBearerAuth(api?: ApiServiceDecoratorOptions): ApiServiceDecoratorOptions | undefined {
    if (!api) return undefined
    return {
        ...api,
        bearerAuth: api.bearerAuth ?? true
    }
}

/** 将方法参数绑定到 URL 查询字符串。 */
export function FeignQuery(name?: string): ParameterDecorator {
    return parameter('query', name)
}

/** 将方法参数绑定到 JSON 请求体。 */
export function FeignBody(): ParameterDecorator {
    return parameter('body')
}

/** 将方法参数绑定到 HTTP 请求头。 */
export function FeignHeader(name: string): ParameterDecorator {
    return parameter('header', name)
}

/** 获取客户端级 Feign 配置。 */
export function getFeignClientOptions<TClient extends object>(
    client: FeignTypes.FeignClientConstructor<TClient>
): FeignTypes.FeignClientOptions | undefined {
    return clientDefinitions.get(client)
}

/** 获取客户端所有方法的 Feign 元数据定义。 */
export function getFeignMethodDefinitions<TClient extends object>(
    client: FeignTypes.FeignClientConstructor<TClient>
): ReadonlyMap<string | symbol, FeignTypes.FeignMethodDefinition> {
    return methodDefinitions.get(client.prototype) ?? new Map()
}
