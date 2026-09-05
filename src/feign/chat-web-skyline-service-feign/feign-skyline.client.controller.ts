import { FeignClient, FeignHeader, FeignPost, FeignBody } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as CrmTypes from './feign-skyline.interface'

/**
 * Skyline 服务业务 Feign 客户端。
 *
 * 请求统一发送到 Nacos `feign.gateway.*` 配置的 Gateway，由 `/feign/skyline`
 * 路由选择 Skyline 服务；服务端在分发实现方法前校验 `feign.service_token`。
 */
@FeignClient({
    name: 'Skyline 服务',
    prefix: '/feign/skyline',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.gateway.url',
    timeoutConfigKey: 'feign.gateway.timeout'
})
export class FeignClientSkylineManager extends FeignWebClient<CrmTypes.FeignClientSkylineImplementation> {}
