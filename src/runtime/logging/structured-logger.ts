import type { LoggerService } from '@nestjs/common'
import { getActiveRequestId } from '@/utils/modules/request-context'
import { getActiveTraceContext } from '@/runtime/observability'
import type { StructuredLoggerOptions } from './logging.interface'

type StructuredLogLevel = 'debug' | 'error' | 'fatal' | 'info' | 'verbose' | 'warn'

export class StructuredLogger implements LoggerService {
    private readonly environment: string

    constructor(private readonly options: StructuredLoggerOptions) {
        this.environment = options.environment?.trim() || process.env.DEPLOYMENT_ENVIRONMENT || process.env.NODE_ENV || 'development'
    }

    log(message: unknown, ...optionalParams: unknown[]): void {
        this.write('info', message, optionalParams)
    }

    fatal(message: unknown, ...optionalParams: unknown[]): void {
        this.write('fatal', message, optionalParams)
    }

    error(message: unknown, ...optionalParams: unknown[]): void {
        this.write('error', message, optionalParams)
    }

    warn(message: unknown, ...optionalParams: unknown[]): void {
        this.write('warn', message, optionalParams)
    }

    debug(message: unknown, ...optionalParams: unknown[]): void {
        this.write('debug', message, optionalParams)
    }

    verbose(message: unknown, ...optionalParams: unknown[]): void {
        this.write('verbose', message, optionalParams)
    }

    private write(level: StructuredLogLevel, message: unknown, optionalParams: unknown[]): void {
        const context = this.resolveContext(optionalParams)
        const stack = level === 'error' || level === 'fatal' ? this.resolveStack(optionalParams) : undefined
        const details = this.normalizeMessage(message)
        const payload = {
            ...details,
            timestamp: new Date().toISOString(),
            level,
            service: this.options.serviceName,
            environment: this.environment,
            ...(context ? { context } : {}),
            ...(getActiveRequestId() ? { logId: getActiveRequestId() } : {}),
            ...getActiveTraceContext(),
            ...(stack ? { stack } : {})
        }
        const line = this.serialize(payload)

        if (level === 'error' || level === 'fatal') console.error(line)
        else if (level === 'warn') console.warn(line)
        else console.log(line)
    }

    private normalizeMessage(message: unknown): Record<string, unknown> {
        if (message instanceof Error) {
            return { message: message.message, stack: message.stack }
        }
        if (message && typeof message === 'object' && !Array.isArray(message)) {
            return message as Record<string, unknown>
        }
        if (Array.isArray(message)) {
            return { message: '结构化日志', data: message }
        }
        return { message: String(message) }
    }

    private resolveContext(optionalParams: unknown[]): string | undefined {
        const candidate = optionalParams.at(-1)
        return typeof candidate === 'string' && !this.looksLikeStack(candidate) ? candidate : undefined
    }

    private resolveStack(optionalParams: unknown[]): string | undefined {
        const candidate = optionalParams.find(value => typeof value === 'string' && this.looksLikeStack(value))
        return typeof candidate === 'string' ? candidate : undefined
    }

    private looksLikeStack(value: string): boolean {
        return value.includes('\n') || /^[A-Za-z]*Error:/.test(value)
    }

    private serialize(payload: Record<string, unknown>): string {
        const seen = new WeakSet<object>()
        return JSON.stringify(payload, (_key, value: unknown) => {
            if (typeof value === 'bigint') return value.toString()
            if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack }
            if (value && typeof value === 'object') {
                if (seen.has(value)) return '[循环引用]'
                seen.add(value)
            }
            return value
        })
    }
}

export function createStructuredLogger(options: StructuredLoggerOptions): StructuredLogger {
    return new StructuredLogger(options)
}
