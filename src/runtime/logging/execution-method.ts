interface StackFrame {
    method?: string
    file: string
    line: string
    column: string
}

const SERVICE_METHOD_PATTERN = /^[A-Za-z0-9_$]+Service\.[A-Za-z0-9_$]+$/

function parseStackFrame(line: string): StackFrame | undefined {
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

function isApplicationFrame(frame: StackFrame): boolean {
    const normalizedFile = frame.file.replace(/\\/g, '/')
    return !normalizedFile.startsWith('node:') && !normalizedFile.includes('/node_modules/')
}

function getMethodSignature(value: string): string {
    return value.replace(/^async\s+/, '').split(/\s+/)[0] ?? value
}

function getClassName(signature: string): string {
    return signature.split('.')[0] ?? signature
}

/** 仅保留 Service.method；Controller、中间件和纯类名都不作为执行方法。 */
export function normalizeServiceExecutionMethod(value: string | undefined): string | undefined {
    if (!value) return undefined

    const signature = getMethodSignature(value.trim())
    return SERVICE_METHOD_PATTERN.test(signature) ? value.trim() : undefined
}

/** 从调用栈定位最内层业务 Service.method，忽略 Controller 与运行时栈帧。 */
export function resolveServiceExecutionMethod(stack?: string, context?: string): string | undefined {
    if (!stack) return undefined

    const methods = stack
        .split(/\r?\n/)
        .map(parseStackFrame)
        .filter((frame): frame is StackFrame => frame !== undefined && isApplicationFrame(frame))
        .map(frame => frame.method)
        .filter((method): method is string => Boolean(normalizeServiceExecutionMethod(method)))

    const preferredClass = context?.trim()
    if (preferredClass && /Service$/.test(preferredClass)) {
        const matched = methods.find(method => getClassName(getMethodSignature(method)) === preferredClass)
        if (matched) return matched
    }

    return methods[0]
}

/** 在当前日志调用处捕获最内层 Service.method。 */
export function captureServiceExecutionMethod(context?: string): string | undefined {
    return resolveServiceExecutionMethod(new Error().stack, context)
}
