import { FeignBody, FeignClient, FeignGet, FeignHeader, FeignPost, FeignQuery } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as CrmTypes from './feign-crm.interface'

@FeignClient({
    name: 'CRM服务',
    prefix: 'feign',
    baseUrlConfigKey: 'feign.chat-web-crm.url',
    timeoutConfigKey: 'feign.chat-web-crm.timeout'
})
export class FeignClientCrmManager extends FeignWebClient<CrmTypes.FeignClientCrmImplementation> {}
