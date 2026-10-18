import { FeignBody, FeignClient, FeignHeader, FeignPost } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import * as SrmDto from './feign-srm.dto'
import type * as SrmTypes from './feign-srm.interface'
import { ConfigService } from '@nestjs/config'

/**
 * SRM 服务业务 Feign 客户端。
 *
 * 请求通过 Gateway 访问 SRM 服务的 `/feign/srm` 服务间入口；Gateway 地址和超时读取
 * Nacos `gateway.feign.url` 与 `gateway.feign.timeout`，服务端在分发实现方法前校验 `gateway.feign.service_token`。
 */
@FeignClient({
    name: 'SRM服务',
    prefix: '/feign/srm',
    serviceTokenKey: 'gateway.feign.service_token',
    baseUrlConfigKey: 'gateway.feign.url',
    timeoutConfigKey: 'gateway.feign.timeout'
})
export class FeignClientSrmManager extends FeignWebClient<SrmTypes.FeignClientSrmImplementation> {
    constructor(service?: SrmTypes.FeignClientSrmImplementation, configService?: ConfigService) {
        super(service, configService)
    }
    /**按供应商主键获取供应商详情**/
    @FeignPost('/user/resolve', {
        operation: { summary: '供内部服务按供应商主键获取供应商详情' },
        request: { source: 'body', type: SrmDto.SrmResolveUserRequestDto },
        response: { type: SrmDto.SrmUserResponseDto, description: '供应商详情' }
    })
    async httpBaseSrmUserResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: SrmTypes.SrmResolveUserInput
    ): Promise<SrmTypes.SrmUser> {
        return this.dispatch('httpBaseSrmUserResolver', _authorization, _input)
    }

    /**按供应商主键批量获取供应商详情**/
    @FeignPost('/user/column/resolve', {
        operation: { summary: '供内部服务按供应商主键批量获取供应商详情' },
        request: { source: 'body', type: SrmDto.SrmColumnUserResolverRequestDto },
        response: { type: SrmDto.SrmUserResponseDto, isArray: true, description: '供应商详情列表' }
    })
    async httpBaseSrmColumnUserResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: SrmTypes.SrmColumnUserResolverInput
    ): Promise<SrmTypes.SrmUser[]> {
        return this.dispatch('httpBaseSrmColumnUserResolver', _authorization, _input)
    }

    /**分页查询供应商列表**/
    @FeignPost('/user/column', {
        operation: { summary: '供内部服务分页查询供应商' },
        request: { source: 'body', type: SrmDto.SrmListUserRequestDto },
        response: { type: SrmDto.SrmUserPageResponseDto, description: '供应商分页数据' }
    })
    async httpBaseSrmColumnUser(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: SrmTypes.SrmListUserInput
    ): Promise<SrmTypes.SrmUserPage> {
        return this.dispatch('httpBaseSrmColumnUser', _authorization, _input)
    }
}
