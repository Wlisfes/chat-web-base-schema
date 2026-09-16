import type { Request } from 'express'

export interface AuthPrincipal {
    uid: string
    number: string
    name: string
    sessionId: string
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
