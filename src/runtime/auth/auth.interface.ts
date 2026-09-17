import type { Request } from 'express'

export interface AuthPrincipal {
    uid: string
    number: string
    name: string
    sessionId: string
    /** 是否为超级管理员；由 AuthorizationGuard 挂载，网关身份上下文不携带。 */
    superAdmin?: boolean
    /** 当前启用角色编码；由 AuthorizationGuard 挂载，不用于数据范围判断。 */
    roleCodes?: string[]
    /** 是否拥有全部数据；空 items 不能表示全部数据。 */
    all?: boolean
    /** 当前请求可访问的用户 UID 并集。 */
    items?: string[]
}

export type AuthSessionIdentity = Pick<AuthPrincipal, 'uid' | 'sessionId'>

export type AuthenticatedRequest = Request & {
    user: AuthPrincipal
}

export interface AccessTokenClaims {
    sub: string
    iss: string
    aud: string
    iat: number
    exp: number
    jti: string
}

export interface AuthTokenAuthenticator {
    authenticateToken(token: string): Promise<AuthSessionIdentity>
}
