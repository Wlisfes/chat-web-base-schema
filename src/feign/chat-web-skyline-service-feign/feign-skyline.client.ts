import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'

/**Skyline服务 Feign 客户端*/
@FeignClient({
    name: 'Skyline服务',
    baseUrlConfigKey: 'feign.chat-web-skyline.url',
    timeoutConfigKey: 'feign.chat-web-skyline.timeout'
})
export class FeignClientSkyline {}
