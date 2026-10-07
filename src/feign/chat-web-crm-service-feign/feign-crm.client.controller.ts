import { FeignBody, FeignClient, FeignHeader, FeignPost } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import * as CrmDto from './feign-crm.dto'
import type * as CrmTypes from './feign-crm.interface'
import { ConfigService } from '@nestjs/config'

/**
 * CRM 服务业务 Feign 客户端。
 *
 * 请求通过 Gateway 访问 CRM 服务的 `/feign/crm` 服务间入口；Gateway 地址和超时读取
 * Nacos `gateway.feign.url` 与 `gateway.feign.timeout`，服务端在分发实现方法前校验 `gateway.feign.service_token`。
 */
@FeignClient({
    name: 'CRM服务',
    prefix: '/feign/crm',
    serviceTokenKey: 'gateway.feign.service_token',
    baseUrlConfigKey: 'gateway.feign.url',
    timeoutConfigKey: 'gateway.feign.timeout'
})
export class FeignClientCrmManager extends FeignWebClient<CrmTypes.FeignClientCrmImplementation> {
    constructor(service?: CrmTypes.FeignClientCrmImplementation, configService?: ConfigService) {
        super(service, configService)
    }
    /**按客户主键获取客户详情**/
    @FeignPost('/user/resolve', {
        operation: { summary: '供内部服务按客户主键获取客户详情' },
        request: { source: 'body', type: CrmDto.CrmResolveUserRequestDto },
        response: { type: CrmDto.CrmUserResponseDto, description: '客户详情' }
    })
    async httpBaseCrmUserResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmResolveUserInput
    ): Promise<CrmTypes.CrmUser> {
        return this.dispatch('httpBaseCrmUserResolver', _authorization, _input)
    }

    /**按客户主键批量获取客户详情**/
    @FeignPost('/user/column/resolve', {
        operation: { summary: '供内部服务按客户主键批量获取客户详情' },
        request: { source: 'body', type: CrmDto.CrmColumnUserResolverRequestDto },
        response: { type: CrmDto.CrmUserResponseDto, isArray: true, description: '客户详情列表' }
    })
    async httpBaseCrmColumnUserResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmColumnUserResolverInput
    ): Promise<CrmTypes.CrmUser[]> {
        return this.dispatch('httpBaseCrmColumnUserResolver', _authorization, _input)
    }

    /**按名称筛选客户下拉数据**/
    @FeignPost('/user/select', {
        operation: { summary: '供内部服务筛选客户下拉数据' },
        request: { source: 'body', type: CrmDto.CrmSelectUserRequestDto },
        response: { type: CrmDto.CrmUserResponseDto, isArray: true, description: '客户下拉列表' }
    })
    async httpBaseCrmSelectUser(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmSelectUserInput
    ): Promise<CrmTypes.CrmUserSelect[]> {
        return this.dispatch('httpBaseCrmSelectUser', _authorization, _input)
    }

    /**创建客户**/
    @FeignPost('/user/create', {
        operation: { summary: '供内部服务创建客户' },
        request: { source: 'body', type: CrmDto.CrmCreateUserRequestDto },
        response: { type: CrmDto.CrmUserResponseDto, description: '客户详情' }
    })
    async httpBaseCrmCreateUser(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmCreateUserInput
    ): Promise<CrmTypes.CrmUser> {
        return this.dispatch('httpBaseCrmCreateUser', _authorization, _input)
    }

    /**更新客户基础信息**/
    @FeignPost('/user/update', {
        operation: { summary: '供内部服务更新客户' },
        request: { source: 'body', type: CrmDto.CrmUpdateUserRequestDto },
        response: { type: CrmDto.CrmUserResponseDto, description: '客户详情' }
    })
    async httpBaseCrmUpdateUser(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmUpdateUserInput
    ): Promise<CrmTypes.CrmUser> {
        return this.dispatch('httpBaseCrmUpdateUser', _authorization, _input)
    }

    /**更新客户启用状态**/
    @FeignPost('/user/status/update', {
        operation: { summary: '供内部服务更新客户状态' },
        request: { source: 'body', type: CrmDto.CrmUpdateUserStatusRequestDto },
        response: { type: CrmDto.CrmUserResponseDto, description: '客户详情' }
    })
    async httpBaseCrmUserStatusUpdate(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmUpdateUserStatusInput
    ): Promise<CrmTypes.CrmUser> {
        return this.dispatch('httpBaseCrmUserStatusUpdate', _authorization, _input)
    }

    /**分页查询客户列表**/
    @FeignPost('/user/column', {
        operation: { summary: '供内部服务分页查询客户' },
        request: { source: 'body', type: CrmDto.CrmListUserRequestDto },
        response: { type: CrmDto.CrmUserPageResponseDto, description: '客户分页数据' }
    })
    async httpBaseCrmColumnUser(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmListUserInput
    ): Promise<CrmTypes.CrmUserPage> {
        return this.dispatch('httpBaseCrmColumnUser', _authorization, _input)
    }
}
