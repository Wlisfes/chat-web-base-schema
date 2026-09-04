import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'

/**CRM服务 Feign 客户端*/
@FeignClient({
    name: 'CRM服务',
    baseUrlConfigKey: 'feign.chat-web-crm.url',
    timeoutConfigKey: 'feign.chat-web-crm.timeout'
})
export class FeignClientCrm {}
