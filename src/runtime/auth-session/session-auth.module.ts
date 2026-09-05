import { Global, Module } from '@nestjs/common'
import { RedisModule } from '../redis'
import { AUTH_TOKEN_AUTHENTICATOR, JwtAuthGuard } from '../auth/jwt-auth.guard'
import { TokenService } from '../auth/token.service'
import { AuthSessionService } from './auth-session.service'
import { SessionAuthenticator } from './session-authenticator.service'

@Global()
@Module({
    imports: [RedisModule],
    providers: [
        TokenService,
        AuthSessionService,
        SessionAuthenticator,
        { provide: AUTH_TOKEN_AUTHENTICATOR, useExisting: SessionAuthenticator },
        JwtAuthGuard
    ],
    exports: [TokenService, AuthSessionService, SessionAuthenticator, JwtAuthGuard]
})
export class SessionAuthModule {}
