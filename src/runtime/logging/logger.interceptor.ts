import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor, Optional } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, tap } from 'rxjs'
import { LOGGER_ENABLED, REQUIRED_PERMISSIONS } from '@/runtime/auth/auth.decorator'
import { sanitizeRequestLogValue } from '@/runtime/logging/request-logging.middleware'
import {
    RabbitmqService,
    SKYLINE_LOGGER_EXCHANGE,
    SKYLINE_LOGGER_ROUTING_KEY,
    type SkylineLoggerPayload
} from '@/runtime/rabbitmq'

interface LoggerRequest {
    method?: string
    originalUrl?: string
    url?: string
    ip?: string
    logId?: string
    body?: unknown
    user?: { uid?: string; number?: string; name?: string }
    headers?: Record<string, string | string[] | undefined>
}

/** 只记录 RequirePermissions 显式开启 logger 的接口。入口直接入队，入队失败不影响接口响应。 */
@Injectable()
export class SkylineLoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(SkylineLoggerInterceptor.name)

    constructor(
        private readonly reflector: Reflector,
        @Optional() private readonly rabbitmqService?: RabbitmqService
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if (context.getType() !== 'http' || !this.rabbitmqService) return next.handle()
        const enabled = this.reflector.get<boolean>(LOGGER_ENABLED, context.getHandler())
        const permissionCode = this.resolvePermissionCode(context)
        if (!enabled || !permissionCode) return next.handle()
        const request = context.switchToHttp().getRequest<LoggerRequest>()
        return next.handle().pipe(
            tap({
                next: data => this.publish(request, permissionCode, data, 'success'),
                error: error => this.publish(request, permissionCode, undefined, 'failure', this.resolveMessage(error))
            })
        )
    }

    /** 多个权限码为或关系，日志只取第一个具体权限码。通配权限不记录。 */
    private resolvePermissionCode(context: ExecutionContext): string | undefined {
        const codes = this.reflector.get<string[]>(REQUIRED_PERMISSIONS, context.getHandler())
        return codes?.find(code => code && code !== '*')
    }

    private publish(
        request: LoggerRequest,
        permissionCode: string,
        data: unknown,
        result: 'success' | 'failure',
        message?: string
    ): void {
        const summary = sanitizeRequestLogValue(request.body)
        const payload: SkylineLoggerPayload = {
            logId: request.logId ?? this.header(request, 'x-request-id') ?? '',
            serviceName: process.env.NACOS_SERVICE_NAME ?? 'unknown-service',
            permissionCode,
            resourceId: this.resolveResourceId(request, data),
            operatorUid: request.user?.uid,
            operatorNumber: request.user?.number,
            operatorName: request.user?.name,
            method: request.method ?? 'UNKNOWN',
            url: (request.originalUrl ?? request.url ?? '').slice(0, 512),
            ip: request.ip,
            result,
            message,
            requestBody: summary === undefined ? undefined : typeof summary === 'string' ? summary : JSON.stringify(summary)
        }
        void this.rabbitmqService
            ?.publish(SKYLINE_LOGGER_EXCHANGE, SKYLINE_LOGGER_ROUTING_KEY, payload, { messageId: payload.logId || undefined })
            .catch(error => this.logger.error('日志入队失败', error))
    }

    /** 优先取请求体里的主键；创建接口没有入参主键时取返回值主键。 */
    private resolveResourceId(request: LoggerRequest, data: unknown): string | undefined {
        const bodyId = this.readPath(request.body, 'keyId') ?? this.readPath(request.body, 'id')
        return bodyId ?? this.readPath(data, 'keyId') ?? this.readPath(data, 'id')
    }

    private readPath(source: unknown, path: string): string | undefined {
        if (!source || typeof source !== 'object') return undefined
        const value = (source as Record<string, unknown>)[path]
        return value === undefined || value === null ? undefined : String(value).slice(0, 64)
    }

    private resolveMessage(error: unknown): string {
        if (error instanceof Error && error.message) return error.message.slice(0, 255)
        return '操作失败'
    }

    private header(request: LoggerRequest, name: string): string | undefined {
        const value = request.headers?.[name]
        return Array.isArray(value) ? value[0] : value
    }
}
