import { ConfigService } from '@nestjs/config'
import { FeignBody, FeignClient, FeignHeader, FeignPost } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import * as AuthDto from './feign-auth.dto'
import type * as AuthTypes from './feign-auth.interface'

/** Auth 服务权限校验客户端；调用方通过 Gateway 访问 Auth 服务。 */
@FeignClient({
    name: '鉴权服务',
    prefix: '/feign/auth',
    serviceTokenKey: 'gateway.feign.service_token',
    baseUrlConfigKey: 'gateway.feign.url',
    timeoutConfigKey: 'gateway.feign.timeout'
})
export class FeignClientAuthManager extends FeignWebClient<AuthTypes.FeignClientAuthImplementation> {
    constructor(service?: AuthTypes.FeignClientAuthImplementation, configService?: ConfigService) {
        super(service, configService)
    }

    /**校验权限码并返回授权身份、角色与数据范围**/
    @FeignPost('/permission/authorized-principal', {
        operation: { summary: '供业务服务校验权限并查询授权身份与数据范围' },
        request: { source: 'body', type: AuthDto.AuthAuthorizedPrincipalRequestDto },
        response: { type: AuthDto.AuthAuthorizedPrincipalResponseDto, description: '授权身份与数据范围' }
    })
    async httpBaseAuthAuthorizedPrincipalResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: AuthTypes.AuthAuthorizedPrincipalInput
    ): Promise<AuthTypes.AuthAuthorizedPrincipalResult> {
        return this.dispatch('httpBaseAuthAuthorizedPrincipalResolver', _authorization, _input)
    }

    /**按账号 UID 清理权限缓存**/
    @FeignPost('/permission/cache/invalidate', {
        operation: { summary: '供账号服务清理权限缓存' },
        request: { source: 'body', type: AuthDto.AuthPermissionCacheInvalidateRequestDto },
        response: { type: AuthDto.AuthPermissionCacheInvalidateResponseDto, description: '缓存清理结果' }
    })
    async httpBaseAuthInvalidatePermissionCache(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: AuthTypes.AuthPermissionCacheInvalidateInput
    ): Promise<AuthTypes.AuthPermissionCacheInvalidateResult> {
        return this.dispatch('httpBaseAuthInvalidatePermissionCache', _authorization, _input)
    }
}
