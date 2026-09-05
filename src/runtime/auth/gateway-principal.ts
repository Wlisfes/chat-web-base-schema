import { createHmac, timingSafeEqual } from 'node:crypto'
import { ConfigService } from '@nestjs/config'
import type { AuthPrincipal } from './auth.interface'

/** 网关注入的签名身份上下文头部名称。 */
export const GATEWAY_PRINCIPAL_HEADER = 'x-gateway-principal'

/**
 * 网关必须无条件剥离的客户端入站头部。
 *
 * 只要允许客户端自带这些头部，签名就形同虚设，因此剥离动作由网关代码强制执行，
 * 不依赖反向代理配置或运维约定。
 */
export const GATEWAY_STRIPPED_HEADERS = [GATEWAY_PRINCIPAL_HEADER, 'x-gateway-service']

/** 身份上下文签名密钥配置键。 */
const PRINCIPAL_SECRET_CONFIG_KEY = 'gateway.principal.secret'
/** 身份上下文有效期配置键；超过该时长的上下文视为重放。 */
const PRINCIPAL_MAX_AGE_CONFIG_KEY = 'gateway.principal.maxAgeSeconds'
/** 允许的时钟偏移秒数。 */
const CLOCK_SKEW_SECONDS = 30

/** 签名身份上下文的载荷；只承载认证结果，不承载授权数据。 */
export interface GatewayPrincipalPayload extends AuthPrincipal {
    /** 签发时间，Unix 秒。 */
    iat: number
}

/** 读取并校验身份上下文签名密钥。 */
export function getGatewayPrincipalSecret(configService: ConfigService): string {
    const secret = configService.get<unknown>(PRINCIPAL_SECRET_CONFIG_KEY)
    if (typeof secret !== 'string' || secret.length < 32) {
        throw new Error(`Nacos 配置 ${PRINCIPAL_SECRET_CONFIG_KEY} 必须至少32位`)
    }
    return secret
}

/** 读取并校验身份上下文有效期。 */
export function getGatewayPrincipalMaxAge(configService: ConfigService): number {
    const configured = configService.get<unknown>(PRINCIPAL_MAX_AGE_CONFIG_KEY)
    if (configured === undefined || configured === null || configured === '') return 60
    const value = Number(configured)
    if (!Number.isInteger(value) || value < 5 || value > 600) {
        throw new Error(`Nacos 配置 ${PRINCIPAL_MAX_AGE_CONFIG_KEY} 必须是 5-600 之间的整数`)
    }
    return value
}

/** 由网关签发身份上下文；载荷与签名之间使用 `.` 分隔。 */
export function signGatewayPrincipal(principal: AuthPrincipal, secret: string, issuedAt = Math.floor(Date.now() / 1000)): string {
    const payload: GatewayPrincipalPayload = { uid: principal.uid, sessionId: principal.sessionId, iat: issuedAt }
    const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
    return `${encoded}.${sign(encoded, secret)}`
}

/** 校验身份上下文并返回身份主体；任何结构、签名或时效问题都返回 undefined。 */
export function verifyGatewayPrincipal(value: string | undefined, secret: string, maxAgeSeconds: number): AuthPrincipal | undefined {
    if (!value || value.length > 4096) return undefined
    const parts = value.split('.')
    if (parts.length !== 2 || !parts[0] || !parts[1]) return undefined

    const [encoded, signature] = parts
    const expected = Buffer.from(sign(encoded, secret), 'base64url')
    const actual = Buffer.from(signature, 'base64url')
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return undefined

    let payload: GatewayPrincipalPayload
    try {
        payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as GatewayPrincipalPayload
    } catch {
        return undefined
    }

    const now = Math.floor(Date.now() / 1000)
    if (
        !payload ||
        typeof payload !== 'object' ||
        typeof payload.uid !== 'string' ||
        !/^\d{1,19}$/.test(payload.uid) ||
        typeof payload.sessionId !== 'string' ||
        !payload.sessionId ||
        !Number.isInteger(payload.iat) ||
        payload.iat > now + CLOCK_SKEW_SECONDS ||
        payload.iat < now - maxAgeSeconds
    ) {
        return undefined
    }
    return { uid: payload.uid, sessionId: payload.sessionId }
}

function sign(value: string, secret: string): string {
    return createHmac('sha256', secret).update(value).digest('base64url')
}
