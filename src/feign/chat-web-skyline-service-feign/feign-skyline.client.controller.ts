import { ConfigService } from '@nestjs/config'
import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import {
    SkylineBatchChunkOptionRequestDto,
    SkylineChunkOptionDto,
    SkylineChunkOptionGroupDto,
    SkylineResolveChunkOptionRequestDto
} from './feign-skyline.dto'
import type * as SkylineTypes from './feign-skyline.interface'

/**
 * Skyline 服务业务 Feign 客户端。
 *
 * 枚举字典属于跨服务基础参考数据，不做用户级数据隔离，因此统一使用服务间凭据调用。
 * 请求通过 Gateway 访问 Skyline 服务的 `/feign/skyline` 服务间入口；Gateway 地址和超时读取
 * Nacos `gateway.feign.url` 与 `gateway.feign.timeout`，服务端在分发实现方法前校验 `gateway.feign.service_token`。
 */
@FeignClient({
    name: 'Skyline 服务',
    prefix: '/feign/skyline',
    serviceTokenKey: 'gateway.feign.service_token',
    baseUrlConfigKey: 'gateway.feign.url',
    timeoutConfigKey: 'gateway.feign.timeout'
})
export class FeignClientSkylineManager extends FeignWebClient<SkylineTypes.FeignClientSkylineImplementation> {
    constructor(service?: SkylineTypes.FeignClientSkylineImplementation, configService?: ConfigService) {
        super(service, configService)
    }

    /**按枚举类型编码批量获取启用状态的枚举字典选项**/
    @FeignPost('/chunk/options/batch', {
        operation: { summary: '供内部服务按枚举类型编码批量获取枚举字典选项' },
        request: { source: 'body', type: SkylineBatchChunkOptionRequestDto },
        response: { type: SkylineChunkOptionGroupDto, isArray: true, description: '按枚举类型编码分组的枚举字典选项' }
    })
    async batchChunkOptions(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: SkylineTypes.SkylineBatchChunkOptionInput
    ): Promise<SkylineTypes.SkylineChunkOptionGroup[]> {
        return this.dispatch('batchChunkOptions', _authorization, _input)
    }

    /**按枚举业务值解析单个启用状态的枚举字典选项**/
    @FeignGet('/chunk/options/resolve', {
        operation: { summary: '供内部服务按枚举业务值解析单个枚举字典选项' },
        request: { source: 'query', type: SkylineResolveChunkOptionRequestDto },
        response: { type: SkylineChunkOptionDto, description: '枚举字典选项' }
    })
    async resolveChunkOption(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery() _input: SkylineTypes.SkylineResolveChunkOptionInput
    ): Promise<SkylineTypes.SkylineChunkOption> {
        return this.dispatch('resolveChunkOption', _authorization, _input)
    }
}
