import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import {
    CrmConsumerPageResponseDto,
    CrmConsumerResponseDto,
    CrmConsumerSelectResponseDto,
    CrmCreateConsumerRequestDto,
    CrmListConsumerRequestDto,
    CrmResolveConsumerRequestDto,
    CrmSelectConsumerRequestDto,
    CrmUpdateConsumerRequestDto,
    CrmUpdateConsumerStatusRequestDto
} from './feign-crm.dto'
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
    @FeignGet('/consumer/resolve', {
        operation: { summary: '供内部服务按客户主键获取客户详情' },
        request: { source: 'query', type: CrmResolveConsumerRequestDto },
        response: { type: CrmConsumerResponseDto, description: '客户详情' }
    })
    async resolveConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('keyId') _keyId: number
    ): Promise<CrmTypes.CrmConsumer> {
        return this.dispatch('resolveConsumer', _authorization, _keyId)
    }

    @FeignGet('/consumer/select', {
        operation: { summary: '供内部服务筛选客户下拉数据' },
        request: { source: 'query', type: CrmSelectConsumerRequestDto },
        response: { type: CrmConsumerResponseDto, isArray: true, description: '客户下拉列表' }
    })
    async selectConsumers(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('name') _name?: string
    ): Promise<CrmTypes.CrmConsumerSelect[]> {
        return this.dispatch('selectConsumers', _authorization, _name)
    }

    @FeignPost('/consumer/create', {
        operation: { summary: '供内部服务创建客户' },
        request: { source: 'body', type: CrmCreateConsumerRequestDto },
        response: { type: CrmConsumerResponseDto, description: '客户详情' }
    })
    async createConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmCreateConsumerInput
    ): Promise<CrmTypes.CrmConsumer> {
        return this.dispatch('createConsumer', _authorization, _input)
    }

    @FeignPost('/consumer/update', {
        operation: { summary: '供内部服务更新客户' },
        request: { source: 'body', type: CrmUpdateConsumerRequestDto },
        response: { type: CrmConsumerResponseDto, description: '客户详情' }
    })
    async updateConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmUpdateConsumerInput
    ): Promise<CrmTypes.CrmConsumer> {
        return this.dispatch('updateConsumer', _authorization, _input)
    }

    @FeignPost('/consumer/update/status', {
        operation: { summary: '供内部服务更新客户状态' },
        request: { source: 'body', type: CrmUpdateConsumerStatusRequestDto },
        response: { type: CrmConsumerResponseDto, description: '客户详情' }
    })
    async updateConsumerStatus(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmUpdateConsumerStatusInput
    ): Promise<CrmTypes.CrmConsumer> {
        return this.dispatch('updateConsumerStatus', _authorization, _input)
    }

    @FeignPost('/consumer/column', {
        operation: { summary: '供内部服务分页查询客户' },
        request: { source: 'body', type: CrmListConsumerRequestDto },
        response: { type: CrmConsumerPageResponseDto, description: '客户分页数据' }
    })
    async columnConsumers(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: CrmTypes.CrmListConsumerInput
    ): Promise<CrmTypes.CrmConsumerPage> {
        return this.dispatch('columnConsumers', _authorization, _input)
    }
}
