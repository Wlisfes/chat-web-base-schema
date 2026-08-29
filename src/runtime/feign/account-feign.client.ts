import type { AuthPrincipal } from '@/runtime/auth/auth.interface'
import { FeignClient, FeignGet, FeignHeader, FeignQuery } from './feign.decorator'

export interface AccountConsumer {
    keyId: number
    uid: string
    ownerUserUid: string
    name: string
    alias?: string
    brandId: number
    currency: string
    email: string
    phone?: string
    status: string
}

@FeignClient({
    name: '账号服务',
    baseUrlConfigKey: 'ACCOUNT_SERVICE_URL',
    defaultBaseUrl: 'http://chat-web-account-service:5010',
    timeoutConfigKey: 'ACCOUNT_AUTH_TIMEOUT_MS',
    defaultTimeoutMs: 3000
})
export class AccountFeignClient {
    @FeignGet('/auth/token/introspect')
    introspect(@FeignHeader('authorization') _authorization: string): Promise<AuthPrincipal> {
        throw new Error('AccountFeignClient 必须由 FeignModule 注入')
    }

    @FeignGet('/consumer/resolver')
    resolveConsumer(@FeignHeader('authorization') _authorization: string, @FeignQuery('keyId') _keyId: number): Promise<AccountConsumer> {
        throw new Error('AccountFeignClient 必须由 FeignModule 注入')
    }

    @FeignGet('/consumer/select')
    selectConsumers(@FeignHeader('authorization') _authorization: string, @FeignQuery('name') _name?: string): Promise<AccountConsumer[]> {
        throw new Error('AccountFeignClient 必须由 FeignModule 注入')
    }
}
