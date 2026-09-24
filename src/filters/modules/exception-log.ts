import { HttpException } from '@nestjs/common'
import { isSensitiveLogKey, sanitizeRequestLogValue } from '@/runtime/logging/request-logging.middleware'

/** 异常对象序列化后的最大长度，超出时截断，避免驱动错误把整条日志撑爆。 */
const MAX_EXCEPTION_LOG_LENGTH = 8192
const MAX_EXCEPTION_DEPTH = 5
const MAX_EXCEPTION_ARRAY_LENGTH = 50

/** Error 自身已单独输出或与 response 重复的属性。 */
const SKIPPED_ERROR_KEYS = new Set(['name', 'message', 'stack', 'response', 'status', 'options'])

interface ValidationErrorLike {
    property: string
    value?: unknown
    constraints?: Record<string, string>
    children?: unknown[]
}

function isValidationErrorLike(value: object): value is ValidationErrorLike {
    const candidate = value as Partial<ValidationErrorLike>
    return typeof candidate.property === 'string' && ('constraints' in candidate || Array.isArray(candidate.children))
}

function serializeValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
    if (typeof value === 'bigint') return value.toString()
    if (typeof value === 'function' || typeof value === 'symbol') return undefined
    if (!value || typeof value !== 'object') return value
    if (seen.has(value)) return '[循环引用]'
    if (depth >= MAX_EXCEPTION_DEPTH) return '[内容层级过深]'
    seen.add(value)

    if (value instanceof Error) return serializeError(value, depth, seen)
    if (Buffer.isBuffer(value)) return `[Buffer ${value.length} 字节]`
    if (value instanceof Date) return value.toISOString()
    if (Array.isArray(value)) return value.slice(0, MAX_EXCEPTION_ARRAY_LENGTH).map(item => serializeValue(item, depth + 1, seen))
    if (isValidationErrorLike(value)) return serializeValidationError(value, depth, seen)

    return Object.fromEntries(
        Object.entries(value)
            .map(([key, item]) => [key, isSensitiveLogKey(key) ? '[已隐藏]' : serializeValue(item, depth + 1, seen)] as const)
            .filter(([, item]) => item !== undefined)
    )
}

/** class-validator 的 ValidationError 带有整个 DTO 实例 target，日志只保留字段、值、约束和子级错误。 */
function serializeValidationError(error: ValidationErrorLike, depth: number, seen: WeakSet<object>): Record<string, unknown> {
    const result: Record<string, unknown> = {
        property: error.property,
        value: isSensitiveLogKey(error.property) ? '[已隐藏]' : serializeValue(error.value, depth + 1, seen)
    }
    if (error.constraints) result.constraints = error.constraints
    if (error.children?.length) result.children = serializeValue(error.children, depth + 1, seen)
    return result
}

function serializeError(error: Error, depth: number, seen: WeakSet<object>): Record<string, unknown> {
    const result: Record<string, unknown> = { name: error.name, message: error.message }
    if (error instanceof HttpException) {
        result.status = error.getStatus()
        result.response = serializeValue(error.getResponse(), depth + 1, seen)
    }
    // 保留驱动和业务附加的自有属性，例如 cause、code、errno、sqlMessage、query、parameters。
    for (const key of Object.getOwnPropertyNames(error)) {
        if (SKIPPED_ERROR_KEYS.has(key)) continue
        const item = isSensitiveLogKey(key)
            ? '[已隐藏]'
            : serializeValue((error as unknown as Record<string, unknown>)[key], depth + 1, seen)
        if (item !== undefined) result[key] = item
    }
    return result
}

/**
 * 把原始异常对象转换为可安全写入日志的结构。
 * 堆栈由 Logger 单独输出；敏感字段脱敏，循环引用和超深层级会被替换为说明文本。
 */
export function serializeExceptionForLog(exception: unknown): unknown {
    return sanitizeRequestLogValue(serializeValue(exception, 0, new WeakSet()), MAX_EXCEPTION_LOG_LENGTH)
}
