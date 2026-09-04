import { FeignClient, FeignGet, FeignHeader, FeignQuery } from '../feign.decorator'
import type * as AccountTypes from './feign-account.interface'
import type * as AuthTypes from '@/runtime/auth/auth.interface'

/**账号服务 Feign 客户端，统一封装鉴权、客户查询等跨服务调用。*/
@FeignClient({
    name: '账号服务',
    baseUrlConfigKey: 'feign.chat-web-account.url',
    timeoutConfigKey: 'feign.chat-web-account.timeout'
})
export class FeignClientAccount {
    /**通过账号服务校验 Bearer Token 并获取当前身份主体。*/
    @FeignGet('/auth/token/introspect')
    introspect(@FeignHeader('authorization') _authorization: string): Promise<AuthTypes.AuthPrincipal> {
        throw new Error('FeignClientAccount 必须由 FeignModule 注入')
    }

    /**按客户主键获取客户详情。*/
    @FeignGet('/consumer/resolver')
    resolveConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('keyId') _keyId: number
    ): Promise<AccountTypes.AccountConsumer> {
        throw new Error('FeignClientAccount 必须由 FeignModule 注入')
    }

    /**按名称筛选客户下拉数据；不传名称时返回可用客户列表。*/
    @FeignGet('/consumer/select')
    selectConsumers(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('name') _name?: string
    ): Promise<AccountTypes.AccountConsumer[]> {
        throw new Error('FeignClientAccount 必须由 FeignModule 注入')
    }
}
