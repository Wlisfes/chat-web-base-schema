import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as CrmTypes from './feign-skyline.interface'

@FeignClient({
    name: 'Skyline 服务',
    prefix: 'feign',
    baseUrlConfigKey: 'feign.chat-web-skyline.url',
    timeoutConfigKey: 'feign.chat-web-skyline.timeout'
})
export class FeignClientSkylineManager extends FeignWebClient<CrmTypes.FeignClientSkylineImplementation> {}
