import { FeignClient, FeignHeader, FeignPost, FeignBody } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as CrmTypes from './feign-skyline.interface'

/**
 * Skyline 服务业务 Feign 客户端。
 *
 * 请求通过 Gateway 访问 Skyline 服务的 `/feign/skyline` 服务间入口；Gateway 地址和超时读取
 * Nacos `feign.url` 与 `feign.timeout`，服务端在分发实现方法前校验 `feign.service_token`。
 */
@FeignClient({
    name: 'Skyline 服务',
    prefix: '/feign/skyline',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.url',
    timeoutConfigKey: 'feign.timeout'
})
export class FeignClientSkylineManager extends FeignWebClient<CrmTypes.FeignClientSkylineImplementation> {}
