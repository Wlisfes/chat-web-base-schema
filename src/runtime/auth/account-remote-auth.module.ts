import { Module } from '@nestjs/common'
import { AccountFeignClient } from '@/runtime/feign/account-feign.client'
import { FeignModule } from '@/runtime/feign/feign.module'
import { AccountAuthClient } from './account-auth.client'
import { AUTH_TOKEN_AUTHENTICATOR, JwtAuthGuard } from './jwt-auth.guard'

@Module({
    imports: [FeignModule.register([AccountFeignClient])],
    providers: [AccountAuthClient, JwtAuthGuard, { provide: AUTH_TOKEN_AUTHENTICATOR, useExisting: AccountAuthClient }],
    exports: [AccountAuthClient, JwtAuthGuard]
})
export class AccountRemoteAuthModule {}
