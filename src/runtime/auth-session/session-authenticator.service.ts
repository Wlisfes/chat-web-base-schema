import { Injectable } from '@nestjs/common'
import { AuthSessionService } from './auth-session.service'
import { AuthPrincipal, AuthTokenAuthenticator } from '../auth/auth.interface'
import { TokenService } from '../auth/token.service'

@Injectable()
export class SessionAuthenticator implements AuthTokenAuthenticator {
    constructor(
        private readonly tokenService: TokenService,
        private readonly sessionService: AuthSessionService
    ) {}

    async authenticateToken(token: string): Promise<AuthPrincipal> {
        const claims = this.tokenService.verifyAccessToken(token)
        await this.sessionService.assertActive(claims)
        return { uid: claims.sub, sessionId: claims.jti }
    }
}
