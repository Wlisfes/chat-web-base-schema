import type {
    FeignClientConstructor,
    FeignClientOptions,
    FeignHttpMethod,
    FeignMethodDefinition,
    FeignParameterKind
} from './feign.interface'

const clientDefinitions = new WeakMap<Function, FeignClientOptions>()
const methodDefinitions = new WeakMap<object, Map<string | symbol, FeignMethodDefinition>>()

function methodDefinition(target: object, propertyKey: string | symbol): FeignMethodDefinition {
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

function request(method: FeignHttpMethod, path: string): MethodDecorator {
    return (target, propertyKey) => {
        const definition = methodDefinition(target, propertyKey)
        definition.method = method
        definition.path = path
    }
}

function parameter(kind: FeignParameterKind, name?: string): ParameterDecorator {
    return (target, propertyKey, parameterIndex) => {
        if (propertyKey === undefined) throw new Error('Feign 参数装饰器只能用于方法')
        const definition = methodDefinition(target, propertyKey)
        definition.parameters = definition.parameters.filter(item => item.index !== parameterIndex)
        definition.parameters.push({ index: parameterIndex, kind, name })
    }
}

export function FeignClient(options: FeignClientOptions): ClassDecorator {
    return target => {
        clientDefinitions.set(target, { ...options })
    }
}

export function FeignGet(path: string): MethodDecorator {
    return request('GET', path)
}

export function FeignPost(path: string): MethodDecorator {
    return request('POST', path)
}

export function FeignQuery(name?: string): ParameterDecorator {
    return parameter('query', name)
}

export function FeignBody(): ParameterDecorator {
    return parameter('body')
}

export function FeignHeader(name: string): ParameterDecorator {
    return parameter('header', name)
}

export function getFeignClientOptions<TClient extends object>(client: FeignClientConstructor<TClient>): FeignClientOptions | undefined {
    return clientDefinitions.get(client)
}

export function getFeignMethodDefinitions<TClient extends object>(
    client: FeignClientConstructor<TClient>
): ReadonlyMap<string | symbol, FeignMethodDefinition> {
    return methodDefinitions.get(client.prototype) ?? new Map()
}
