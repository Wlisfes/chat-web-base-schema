import { Global, Module } from '@nestjs/common'
import { RedisModule } from '../redis'
import { AuthSessionService } from './auth-session.service'
import { AUTH_TOKEN_AUTHENTICATOR, JwtAuthGuard } from './jwt-auth.guard'
import { SessionAuthenticator } from './session-authenticator.service'
import { TokenService } from './token.service'

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
