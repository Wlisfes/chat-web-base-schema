import { Module } from '@nestjs/common'
import { ACCOUNT_AUTH_FETCH, AccountAuthClient } from './account-auth.client'
import { AUTH_TOKEN_AUTHENTICATOR, JwtAuthGuard } from './jwt-auth.guard'

@Module({
    providers: [
        AccountAuthClient,
        JwtAuthGuard,
        { provide: ACCOUNT_AUTH_FETCH, useValue: fetch },
        { provide: AUTH_TOKEN_AUTHENTICATOR, useExisting: AccountAuthClient }
    ],
    exports: [AccountAuthClient, JwtAuthGuard]
})
export class AccountRemoteAuthModule {}
