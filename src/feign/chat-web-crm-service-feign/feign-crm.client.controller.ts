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
    @FeignPost('/consumer/resolve', {
        operation: { summary: '供内部服务按客户主键获取客户详情' },
        request: { source: 'body', type: CrmDto.CrmResolveConsumerRequestDto },
        response: { type: CrmDto.CrmConsumerResponseDto, description: '客户详情' }
    })
    async httpBaseCrmConsumerResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmResolveConsumerInput
    ): Promise<CrmTypes.CrmConsumer> {
        return this.dispatch('httpBaseCrmConsumerResolver', _authorization, _input)
    }

    /**按名称筛选客户下拉数据**/
    @FeignPost('/consumer/select', {
        operation: { summary: '供内部服务筛选客户下拉数据' },
        request: { source: 'body', type: CrmDto.CrmSelectConsumerRequestDto },
        response: { type: CrmDto.CrmConsumerResponseDto, isArray: true, description: '客户下拉列表' }
    })
    async httpBaseCrmSelectConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmSelectConsumerInput
    ): Promise<CrmTypes.CrmConsumerSelect[]> {
        return this.dispatch('httpBaseCrmSelectConsumer', _authorization, _input)
    }

    /**创建客户**/
    @FeignPost('/consumer/create', {
        operation: { summary: '供内部服务创建客户' },
        request: { source: 'body', type: CrmDto.CrmCreateConsumerRequestDto },
        response: { type: CrmDto.CrmConsumerResponseDto, description: '客户详情' }
    })
    async httpBaseCrmCreateConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmCreateConsumerInput
    ): Promise<CrmTypes.CrmConsumer> {
        return this.dispatch('httpBaseCrmCreateConsumer', _authorization, _input)
    }

    /**更新客户基础信息**/
    @FeignPost('/consumer/update', {
        operation: { summary: '供内部服务更新客户' },
        request: { source: 'body', type: CrmDto.CrmUpdateConsumerRequestDto },
        response: { type: CrmDto.CrmConsumerResponseDto, description: '客户详情' }
    })
    async httpBaseCrmUpdateConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmUpdateConsumerInput
    ): Promise<CrmTypes.CrmConsumer> {
        return this.dispatch('httpBaseCrmUpdateConsumer', _authorization, _input)
    }

    /**更新客户启用状态**/
    @FeignPost('/consumer/update/status', {
        operation: { summary: '供内部服务更新客户状态' },
        request: { source: 'body', type: CrmDto.CrmUpdateConsumerStatusRequestDto },
        response: { type: CrmDto.CrmConsumerResponseDto, description: '客户详情' }
    })
    async httpBaseCrmUpdateConsumerStatus(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmUpdateConsumerStatusInput
    ): Promise<CrmTypes.CrmConsumer> {
        return this.dispatch('httpBaseCrmUpdateConsumerStatus', _authorization, _input)
    }

    /**分页查询客户列表**/
    @FeignPost('/consumer/column', {
        operation: { summary: '供内部服务分页查询客户' },
        request: { source: 'body', type: CrmDto.CrmListConsumerRequestDto },
        response: { type: CrmDto.CrmConsumerPageResponseDto, description: '客户分页数据' }
    })
    async httpBaseCrmColumnConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmListConsumerInput
    ): Promise<CrmTypes.CrmConsumerPage> {
        return this.dispatch('httpBaseCrmColumnConsumer', _authorization, _input)
    }
}
