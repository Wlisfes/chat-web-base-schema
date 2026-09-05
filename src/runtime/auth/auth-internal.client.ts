import {
    BadGatewayException,
    Injectable,
    Logger,
    OnApplicationBootstrap,
    ServiceUnavailableException,
    UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getActiveRequestId } from '@/utils/modules/request-context'
import type { AuthPrincipal, AuthTokenAuthenticator } from './auth.interface'

/** 鉴权服务地址与超时配置键；与业务 Feign 使用同一命名规则，但不注册为业务客户端。 */
const AUTH_URL_CONFIG_KEY = 'feign.chat-web-auth.url'
const AUTH_TIMEOUT_CONFIG_KEY = 'feign.chat-web-auth.timeout'
/** 服务间共享凭据配置键；用户令牌与服务凭据必须分离传输。 */
const AUTH_SERVICE_TOKEN_CONFIG_KEY = 'feign.service_token'
/** 鉴权服务内部内省协议路径；该路径不对外暴露，也不进入网关公开路由。 */
const AUTH_INTROSPECT_PATH = '/internal/auth/token/introspect'

/** 内部认证接口的统一响应外壳。 */
interface AuthResponseEnvelope {
    code?: unknown
    message?: unknown
    data?: unknown
}

/**
 * 鉴权服务内部认证客户端。
 *
 * 认证属于基础设施边界而非业务 Feign：用户令牌通过请求体传递，调用方身份通过
 * X-Service-Token 校验，因此不复用业务 Feign 客户端的 Authorization 约定。
 */
@Injectable()
export class AuthInternalClient implements AuthTokenAuthenticator, OnApplicationBootstrap {
    private readonly logger = new Logger(AuthInternalClient.name)

    constructor(private readonly configService: ConfigService) {}

    /** 启动时校验鉴权服务连接配置，避免首个受保护请求才暴露配置缺失。 */
    public onApplicationBootstrap(): void {
        this.getBaseUrl()
        this.getTimeout()
        this.getServiceToken()
    }

    /** 调用鉴权服务校验用户访问令牌并返回身份主体。 */
    public async authenticateToken(token: string): Promise<AuthPrincipal> {
        // 配置解析必须发生在请求之前，避免配置错误被统一转换为上游不可用。
        const endpoint = new URL(AUTH_INTROSPECT_PATH, this.getBaseUrl())
        const serviceToken = this.getServiceToken()
        const timeout = this.getTimeout()
        const requestId = getActiveRequestId()
        let response: Response
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'x-service-token': serviceToken,
                    ...(requestId ? { 'x-request-id': requestId } : {})
                },
                body: JSON.stringify({ token }),
                signal: AbortSignal.timeout(timeout)
            })
        } catch (error) {
            this.logger.warn(`鉴权服务请求失败：${error instanceof Error ? error.message : String(error)}`)
            throw new ServiceUnavailableException('鉴权服务暂不可用')
        }

        let envelope: AuthResponseEnvelope
        try {
            envelope = (await response.json()) as AuthResponseEnvelope
        } catch {
            throw new BadGatewayException('鉴权服务返回了无效响应')
        }

        const code = typeof envelope.code === 'number' ? envelope.code : response.status
        const message = typeof envelope.message === 'string' && envelope.message.trim() ? envelope.message : '访问令牌无效'
        if (response.status === 401 || response.status === 403 || code === 401 || code === 403) {
            throw new UnauthorizedException(message)
        }
        if (!response.ok || code !== 200) {
            throw new BadGatewayException('鉴权服务返回异常')
        }
        if (!this.isPrincipal(envelope.data)) {
            throw new BadGatewayException('鉴权服务返回了无效身份主体')
        }
        return envelope.data
    }

    /** 读取并校验鉴权服务地址。 */
    private getBaseUrl(): URL {
        const configured = this.configService.get<unknown>(AUTH_URL_CONFIG_KEY)
        if (typeof configured !== 'string' || !configured.trim()) {
            throw new Error(`Nacos 配置 ${AUTH_URL_CONFIG_KEY} 必须是非空字符串`)
        }
        let url: URL
        try {
            url = new URL(configured.trim().replace(/\/+$/, '') + '/')
        } catch {
            throw new Error(`Nacos 配置 ${AUTH_URL_CONFIG_KEY} 格式无效`)
        }
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error(`Nacos 配置 ${AUTH_URL_CONFIG_KEY} 必须使用 http:// 或 https://`)
        }
        return url
    }

    /** 读取并校验鉴权服务请求超时。 */
    private getTimeout(): number {
        const configured = this.configService.get<unknown>(AUTH_TIMEOUT_CONFIG_KEY)
        if (configured === undefined || configured === null || configured === '') {
            throw new Error(`Nacos 配置 ${AUTH_TIMEOUT_CONFIG_KEY} 必须配置`)
        }
        const value = Number(configured)
        if (!Number.isInteger(value) || value < 100 || value > 30_000) {
            throw new Error(`Nacos 配置 ${AUTH_TIMEOUT_CONFIG_KEY} 必须是 100-30000 之间的整数`)
        }
        return value
    }

    /** 读取并规范化服务间共享凭据。 */
    private getServiceToken(): string {
        const configured = this.configService.get<unknown>(AUTH_SERVICE_TOKEN_CONFIG_KEY)
        if (typeof configured !== 'string' || !configured.trim()) {
            throw new Error(`Nacos 配置 ${AUTH_SERVICE_TOKEN_CONFIG_KEY} 必须是非空字符串`)
        }
        return configured.trim().replace(/^Bearer\s+/i, '')
    }

    /** 校验鉴权服务返回的身份主体结构。 */
    private isPrincipal(value: unknown): value is AuthPrincipal {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return false
        const principal = value as Partial<AuthPrincipal>
        return (
            typeof principal.uid === 'string' &&
            principal.uid.length > 0 &&
            typeof principal.sessionId === 'string' &&
            principal.sessionId.length > 0
        )
    }
}
