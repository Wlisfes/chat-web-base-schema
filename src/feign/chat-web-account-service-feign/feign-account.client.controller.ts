import { FeignClient, FeignGet, FeignHeader } from '../feign.decorator'
import { AuthPrincipalResponseDto } from '@/runtime/auth/auth.dto'
import { FeignWebClient } from '../feign.web.client'
import type * as AccountTypes from './feign-account.interface'
import type * as AuthTypes from '@/runtime/auth/auth.interface'

@FeignClient({
    name: '账号服务',
    prefix: 'feign',
    baseUrlConfigKey: 'feign.chat-web-account.url',
    timeoutConfigKey: 'feign.chat-web-account.timeout'
})
export class FeignClientAccountManager extends FeignWebClient<AccountTypes.FeignClientAccountImplementation> {
    constructor(service?: AccountTypes.FeignClientAccountImplementation) {
        super(service)
    }

    @FeignGet('/auth/token/introspect', {
        operation: { summary: '供内部服务校验访问令牌并获取身份主体' },
        response: { type: AuthPrincipalResponseDto, description: '令牌对应的身份主体' }
    })
    async introspect(@FeignHeader('authorization') _authorization: string): Promise<AuthTypes.AuthPrincipal> {
        return this.dispatch('introspect', _authorization)
    }
}
