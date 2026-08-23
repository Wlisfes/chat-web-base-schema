import { HttpStatus, type Type, applyDecorators } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiExtraModels,
    ApiOperation,
    ApiProduces,
    ApiResponse,
    DECORATORS,
    type ApiBodyOptions,
    type ApiOperationOptions,
    type OpenAPIObject
} from '@nestjs/swagger'
import { ApiResponseDocumentDto } from '@/decorator/api-response.dto'

type DocumentType = Type<unknown> | StringConstructor | NumberConstructor | BooleanConstructor
type DocumentSchema = NonNullable<NonNullable<OpenAPIObject['components']>['schemas']>[string]

export interface ApiServiceRequestOptions {
    /** 参数来源；body 会显式生成 requestBody，query 由 @Query DTO 展开字段。 */
    source: 'body' | 'query'
    /** 请求 DTO 类型。 */
    type: DocumentType
    /** 请求体是否为 DTO 数组。 */
    isArray?: boolean
    /** 请求参数是否必填。 */
    required?: boolean
    /** 请求参数说明。 */
    description?: string
}

export interface ApiServiceResponseOptions {
    /** HTTP 状态码。 */
    status?: number
    /** 响应说明。 */
    description?: string
    /** data 字段的 DTO 或基础类型。 */
    type?: DocumentType
    /** data 字段是否为数组。 */
    isArray?: boolean
    /** 完全自定义 data 或原始响应 Schema。 */
    schema?: DocumentSchema
    /** 响应示例。 */
    example?: unknown
    /** 响应媒体类型。 */
    contentType?: string
    /** 是否使用统一响应外壳；原始文件、重定向等响应应设为 false。 */
    envelope?: boolean
}

export interface ApiServiceDecoratorOptions {
    /** 接口用途和摘要。 */
    operation: ApiOperationOptions
    /** 请求文档定义。 */
    request?: ApiServiceRequestOptions
    /** 响应文档定义。 */
    response: ApiServiceResponseOptions
    /** 是否声明 Bearer Token 鉴权。 */
    bearerAuth?: boolean
    /** 可接收的请求媒体类型。 */
    consumes?: string[]
    /** 可返回的响应媒体类型。 */
    produces?: string[]
}

function isModelType(type: DocumentType): type is Type<unknown> {
    return type !== String && type !== Number && type !== Boolean
}

function createTypeSchema(type: DocumentType): DocumentSchema {
    if (type === String) return { type: 'string' }
    if (type === Number) return { type: 'number' }
    if (type === Boolean) return { type: 'boolean' }
    return createModelSchema(type)
}

function createDataSchema(response: ApiServiceResponseOptions): DocumentSchema {
    const schema = response.schema ?? (response.type ? createTypeSchema(response.type) : { type: 'object' })
    return response.isArray ? { type: 'array', items: schema } : schema
}

function createResponseSchema(response: ApiServiceResponseOptions): DocumentSchema {
    const dataSchema = createDataSchema(response)
    if (response.envelope === false) return dataSchema
    return {
        type: 'object',
        properties: {
            data: dataSchema,
            code: { type: 'number', description: '业务状态码', example: 200 },
            message: { type: 'string', description: '响应消息', example: 'success' },
            timestamp: { type: 'string', description: '服务端响应时间', example: '2026-08-23 12:00:00' }
        },
        required: ['data', 'code', 'message', 'timestamp']
    }
}

interface ApiPropertyDocumentMetadata {
    type?: unknown
    isArray?: boolean
    example?: unknown
    default?: unknown
    enum?: unknown[]
    description?: string
    required?: boolean
    format?: string
    nullable?: boolean
    readOnly?: boolean
    writeOnly?: boolean
    deprecated?: boolean
    minimum?: number
    maximum?: number
    minLength?: number
    maxLength?: number
    minItems?: number
    maxItems?: number
    pattern?: string
}

function resolvePropertyType(type: unknown): unknown {
    if (typeof type === 'function' && type.name === 'type') return type()
    return type
}

function createPrimitiveExample(type: unknown): unknown {
    if (type === String || type === 'string') return 'string'
    if (type === Number || type === 'number' || type === 'integer') return 1
    if (type === Boolean || type === 'boolean') return true
    if (type === Date) return '2026-08-23 12:00:00'
    return undefined
}

function createPrimitiveSchema(type: unknown): DocumentSchema {
    if (type === String || type === 'string') return { type: 'string' }
    if (type === Number || type === 'number') return { type: 'number' }
    if (type === 'integer') return { type: 'integer' }
    if (type === Boolean || type === 'boolean') return { type: 'boolean' }
    if (type === Date) return { type: 'string', format: 'date-time' }
    return { type: 'object' }
}

function applyPropertyMetadata(schema: DocumentSchema, metadata: ApiPropertyDocumentMetadata): DocumentSchema {
    if ('$ref' in schema) return schema
    const result = { ...schema }
    const keys = [
        'example',
        'default',
        'enum',
        'description',
        'format',
        'nullable',
        'readOnly',
        'writeOnly',
        'deprecated',
        'minimum',
        'maximum',
        'minLength',
        'maxLength',
        'minItems',
        'maxItems',
        'pattern'
    ] as const
    for (const key of keys) {
        const value = metadata[key]
        if (value !== undefined) Object.assign(result, { [key]: value })
    }
    return result
}

function createModelSchema(type: unknown, visited = new Set<unknown>()): DocumentSchema {
    if (typeof type !== 'function') return createPrimitiveSchema(type)
    if (type === String || type === Number || type === Boolean || type === Date) return createPrimitiveSchema(type)
    if (visited.has(type)) return { type: 'object' }

    const nextVisited = new Set(visited).add(type)
    const prototype = type.prototype as object
    const propertyNames = (Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, prototype) ?? []) as string[]
    const properties: Record<string, DocumentSchema> = {}
    const required: string[] = []
    for (const property of propertyNames) {
        const propertyName = property.replace(/^:/, '')
        const metadata = (Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, prototype, propertyName) ??
            {}) as ApiPropertyDocumentMetadata
        const propertyType = resolvePropertyType(metadata.type)
        const propertySchema = createModelSchema(propertyType, nextVisited)
        properties[propertyName] = metadata.isArray
            ? applyPropertyMetadata({ type: 'array', items: propertySchema }, metadata)
            : applyPropertyMetadata(propertySchema, metadata)
        if (metadata.required !== false) required.push(propertyName)
    }
    return {
        type: 'object',
        properties,
        ...(required.length ? { required } : {})
    }
}

function createModelExample(type: unknown, visited = new Set<unknown>()): unknown {
    const primitive = createPrimitiveExample(type)
    if (primitive !== undefined) return primitive
    if (typeof type !== 'function' || visited.has(type)) return {}

    const nextVisited = new Set(visited).add(type)
    const prototype = type.prototype as object
    const properties = (Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, prototype) ?? []) as string[]
    const example: Record<string, unknown> = {}
    for (const property of properties) {
        const propertyName = property.replace(/^:/, '')
        const metadata = (Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, prototype, propertyName) ??
            {}) as ApiPropertyDocumentMetadata
        let value = metadata.example ?? metadata.default ?? metadata.enum?.[0]
        if (value === undefined) {
            value = createModelExample(resolvePropertyType(metadata.type), nextVisited)
            if (metadata.isArray) value = [value]
        }
        example[propertyName] = value
    }
    return example
}

function createSchemaExample(schema: DocumentSchema): unknown {
    if ('example' in schema && schema.example !== undefined) return schema.example
    if ('$ref' in schema) return {}
    if (schema.enum?.length) return schema.enum[0]
    if (schema.type === 'array') return schema.items ? [createSchemaExample(schema.items)] : []
    if (schema.type === 'object' || schema.properties) {
        return Object.fromEntries(
            Object.entries(schema.properties ?? {}).map(([propertyName, propertySchema]) => [
                propertyName,
                createSchemaExample(propertySchema)
            ])
        )
    }
    return createPrimitiveExample(schema.type)
}

function createResponseExample(response: ApiServiceResponseOptions): unknown {
    if (response.example !== undefined) return response.example
    let data = response.type ? createModelExample(response.type) : createSchemaExample(response.schema ?? { type: 'object' })
    if (response.isArray) data = [data]
    if (response.envelope === false) return data
    return {
        data: data ?? null,
        code: response.status ?? HttpStatus.OK,
        message: 'success',
        timestamp: '2026-08-23 12:00:00'
    }
}

/** 聚合 HTTP 路由、Swagger/Apifox 请求与统一响应文档装饰器。 */
export function ApiServiceDecorator(methodRequest: MethodDecorator, options: ApiServiceDecoratorOptions): MethodDecorator {
    const response = options.response
    const consumes = options.consumes ?? ['application/json']
    const produces = options.produces ?? [response.contentType ?? 'application/json']
    const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
        methodRequest,
        ApiOperation(options.operation),
        ApiConsumes(...consumes),
        ApiProduces(...produces),
        ApiExtraModels(ApiResponseDocumentDto),
        ApiResponse({
            status: response.status ?? HttpStatus.OK,
            description: response.description ?? '请求成功',
            content: {
                [response.contentType ?? 'application/json']: {
                    schema: createResponseSchema(response),
                    example: createResponseExample(response)
                }
            }
        })
    ]

    const modelTypes = [options.request?.type, response.type].filter(
        (type): type is Type<unknown> => type !== undefined && isModelType(type)
    )
    if (modelTypes.length) {
        decorators.push(ApiExtraModels(...modelTypes))
    }

    if (options.request?.source === 'body') {
        const bodyOptions: ApiBodyOptions = {
            type: options.request.type,
            isArray: options.request.isArray,
            required: options.request.required ?? true,
            description: options.request.description
        }
        decorators.push(ApiBody(bodyOptions))
    }

    if (options.bearerAuth) {
        decorators.push(ApiBearerAuth('authorization'))
    }

    return applyDecorators(...decorators)
}
