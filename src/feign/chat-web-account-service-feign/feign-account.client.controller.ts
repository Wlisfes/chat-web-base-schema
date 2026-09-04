import { FeignClient, FeignGet, FeignHeader } from '../feign.decorator'
import { AuthPrincipalResponseDto } from '@/runtime/auth/auth.dto'
import { FeignWebClient } from '../feign.web.client'
import type { AccountFeignServiceImplementation } from './feign-account.interface'
import type * as AuthTypes from '@/runtime/auth/auth.interface'

/** 账号服务 Feign 客户端，统一封装跨服务鉴权调用。 */
@FeignClient({
    name: '账号服务',
    baseUrlConfigKey: 'feign.chat-web-account.url',
    timeoutConfigKey: 'feign.chat-web-account.timeout'
})
export class FeignClientAccountManager extends FeignWebClient<AccountFeignServiceImplementation> {
    /** 调用端由 FeignModule 创建代理；服务端 Controller 可传入 FeignService 复用同一组路由元数据。 */
    constructor(implementation?: AccountFeignServiceImplementation) {
        super(implementation)
    }

    @FeignGet('/auth/token/introspect', {
        operation: { summary: '供内部服务校验访问令牌并获取身份主体' },
        response: { type: AuthPrincipalResponseDto, description: '令牌对应的身份主体' }
    })
    async introspect(@FeignHeader('authorization') _authorization: string): Promise<AuthTypes.AuthPrincipal> {
        return this.dispatch('introspect', _authorization)
    }
}
