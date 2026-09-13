import { ConfigService } from '@nestjs/config'
import { FeignBody, FeignClient, FeignHeader, FeignPost } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import {
    AuthPermissionCacheInvalidateRequestDto,
    AuthPermissionCacheInvalidateResponseDto,
    AuthPermissionCheckRequestDto,
    AuthPermissionCheckResponseDto
} from './feign-auth.dto'
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

    @FeignPost('/permission/check', {
        operation: { summary: '供业务服务校验用户权限码' },
        request: { source: 'body', type: AuthPermissionCheckRequestDto },
        response: { type: AuthPermissionCheckResponseDto, description: '权限校验结果' }
    })
    async checkPermission(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: AuthTypes.AuthPermissionCheckInput
    ): Promise<AuthTypes.AuthPermissionCheckResult> {
        return this.dispatch('checkPermission', _authorization, _input)
    }

    @FeignPost('/permission/cache/invalidate', {
        operation: { summary: '供账号服务清理权限缓存' },
        request: { source: 'body', type: AuthPermissionCacheInvalidateRequestDto },
        response: { type: AuthPermissionCacheInvalidateResponseDto, description: '缓存清理结果' }
    })
    async invalidatePermissionCache(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: AuthTypes.AuthPermissionCacheInvalidateInput
    ): Promise<AuthTypes.AuthPermissionCacheInvalidateResult> {
        return this.dispatch('invalidatePermissionCache', _authorization, _input)
    }
}
