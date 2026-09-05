import { FeignClient, FeignHeader, FeignPost, FeignBody } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as CrmTypes from './feign-skyline.interface'

@FeignClient({
    name: 'Skyline 服务',
    prefix: '/feign/skyline',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.gateway.url',
    timeoutConfigKey: 'feign.gateway.timeout'
})
export class FeignClientSkylineManager extends FeignWebClient<CrmTypes.FeignClientSkylineImplementation> {}
