import { FeignClient, FeignHeader, FeignPost, FeignBody } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as CrmTypes from './feign-skyline.interface'

@FeignClient({
    name: 'Skyline 服务',
    prefix: '/feign/skyline',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.chat-web-skyline.url',
    timeoutConfigKey: 'feign.chat-web-skyline.timeout'
})
export class FeignClientSkylineManager extends FeignWebClient<CrmTypes.FeignClientSkylineImplementation> {}
