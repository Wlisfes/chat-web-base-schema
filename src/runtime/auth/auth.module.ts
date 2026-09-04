import { Module } from '@nestjs/common'
import { FeignClientAccount } from '@/feign/chat-web-account-service-feign/feign-account.client.controller'
import { FeignModule } from '@/feign/feign.module'
import { AuthClient } from './auth.client'
import { AUTH_TOKEN_AUTHENTICATOR, JwtAuthGuard } from './jwt-auth.guard'

@Module({
    imports: [FeignModule.register([FeignClientAccount])],
    providers: [AuthClient, JwtAuthGuard, { provide: AUTH_TOKEN_AUTHENTICATOR, useExisting: AuthClient }],
    exports: [AuthClient, JwtAuthGuard]
})
export class AuthModule {}
