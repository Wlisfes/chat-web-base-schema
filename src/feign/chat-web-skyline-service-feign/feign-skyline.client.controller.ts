import { FeignClient, FeignHeader, FeignPost, FeignBody } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as CrmTypes from './feign-skyline.interface'

/**
 * Skyline 服务业务 Feign 客户端。
 *
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
export class FeignClientSkylineManager extends FeignWebClient<CrmTypes.FeignClientSkylineImplementation> {}
