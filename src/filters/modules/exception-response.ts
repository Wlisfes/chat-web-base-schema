import { HttpException, HttpStatus } from '@nestjs/common'

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getExceptionResponse(exception: unknown): unknown {
    if (exception instanceof HttpException) {
        return exception.getResponse()
    }
    if (isRecord(exception) && typeof exception.getError === 'function') {
        return exception.getError()
    }
    if (isRecord(exception) && 'response' in exception) {
        return exception.response
    }
    return undefined
}

function firstMessage(value: unknown): string | undefined {
    if (Array.isArray(value)) {
        return value.length > 0 ? firstMessage(value[0]) : undefined
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        return value
    }
    if (isRecord(value)) {
        return firstMessage(value.message)
    }
    return undefined
}

interface ExceptionStackFrame {
    method?: string
    file: string
    line: string
    column: string
}

function parseStackFrame(line: string): ExceptionStackFrame | undefined {
    const methodMatch = line.match(/^\s*at\s+(.+?)\s+\((.+):(\d+):(\d+)\)$/)
    if (methodMatch) {
        return {
            method: methodMatch[1].replace(/^async\s+/, ''),
            file: methodMatch[2],
            line: methodMatch[3],
            column: methodMatch[4]
        }
    }

    const locationMatch = line.match(/^\s*at\s+(.+):(\d+):(\d+)$/)
    if (!locationMatch) return undefined

    return {
        file: locationMatch[1],
        line: locationMatch[2],
        column: locationMatch[3]
    }
}

function isApplicationFrame(frame: ExceptionStackFrame): boolean {
    const normalizedFile = frame.file.replace(/\\/g, '/')
    return (
        !normalizedFile.startsWith('node:') &&
        !normalizedFile.includes('/node_modules/') &&
        !normalizedFile.includes('/src/filters/modules/')
    )
}

/** 从异常堆栈中定位实际抛错方法；无法定位时回退到当前 Controller 方法。 */
export function resolveExceptionExecutionMethod(exception: unknown, fallback = 'HttpExceptionFilter'): string {
    const stack = exception instanceof Error ? exception.stack : undefined
    if (!stack) return fallback

    const frames = stack
        .split(/\r?\n/)
        .map(parseStackFrame)
        .filter((frame): frame is ExceptionStackFrame => frame !== undefined)
    const frame = frames.find(isApplicationFrame)
    if (!frame) return fallback

    const fileName = frame.file.replace(/\\/g, '/').split('/').at(-1) ?? frame.file
    const location = `${fileName}:${frame.line}:${frame.column}`
    return frame.method ? `${frame.method} (${location})` : location
}

/** 从 Nest HTTP/RPC 异常中解析业务状态码。 */
export function resolveExceptionStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
        return exception.getStatus()
    }
    const exceptionResponse = getExceptionResponse(exception)
    const candidates = [
        isRecord(exception) ? exception.status : undefined,
        isRecord(exception) ? exception.statusCode : undefined,
        isRecord(exceptionResponse) ? exceptionResponse.status : undefined,
        isRecord(exceptionResponse) ? exceptionResponse.statusCode : undefined
    ]
    const status = candidates.find(value => typeof value === 'number' && Number.isInteger(value) && value >= 400 && value <= 599)
    return typeof status === 'number' ? status : HttpStatus.INTERNAL_SERVER_ERROR
}

/** 从 Nest HTTP/RPC 异常中解析可安全返回给客户端的消息。 */
export function resolveExceptionMessage(exception: unknown, status: number): string {
    const responseMessage = firstMessage(getExceptionResponse(exception))
    if (responseMessage && (status < HttpStatus.INTERNAL_SERVER_ERROR || exception instanceof HttpException)) {
        return responseMessage
    }
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        return '服务器内部错误'
    }
    if (exception instanceof Error && exception.message.trim().length > 0) {
        return exception.message
    }
    return '请求处理失败'
}

/** 只透传显式声明的异常 data，避免将异常对象或 options 暴露给客户端。 */
export function resolveExceptionData(exception: unknown): unknown {
    const exceptionResponse = getExceptionResponse(exception)
    return isRecord(exceptionResponse) && 'data' in exceptionResponse ? (exceptionResponse.data ?? null) : null
}
