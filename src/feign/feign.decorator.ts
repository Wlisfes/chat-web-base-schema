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

/** 为方法记录 HTTP 方法和服务端相对路径。 */
function request(method: FeignTypes.FeignHttpMethod, path: string): MethodDecorator {
    return (target, propertyKey) => {
        const definition = methodDefinition(target, propertyKey)
        definition.method = method
        definition.path = path
    }
}

/** 为方法参数记录 HTTP 请求位置和参数名称。 */
function parameter(kind: FeignTypes.FeignParameterKind, name?: string): ParameterDecorator {
    return (target, propertyKey, parameterIndex) => {
        if (propertyKey === undefined) throw new Error('Feign 参数装饰器只能用于方法')
        const definition = methodDefinition(target, propertyKey)
        definition.parameters = definition.parameters.filter(item => item.index !== parameterIndex)
        definition.parameters.push({ index: parameterIndex, kind, name })
    }
}

/** 声明 Feign 客户端的服务名称、地址配置键和超时配置。 */
export function FeignClient(options: FeignTypes.FeignClientOptions): ClassDecorator {
    return target => {
        clientDefinitions.set(target, { ...options })
    }
}

/** 将方法声明为 GET 请求。 */
export function FeignGet(path: string): MethodDecorator {
    return request('GET', path)
}

/** 将方法声明为 POST 请求。 */
export function FeignPost(path: string): MethodDecorator {
    return request('POST', path)
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
