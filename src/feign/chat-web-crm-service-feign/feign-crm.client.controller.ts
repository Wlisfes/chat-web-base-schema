import { FeignClient, FeignHeader, FeignPost, FeignBody } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import type * as CrmTypes from './feign-crm.interface'

@FeignClient({
    name: 'CRM服务',
    prefix: '/feign/crm',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.gateway.url',
    timeoutConfigKey: 'feign.gateway.timeout'
})
export class FeignClientCrmManager extends FeignWebClient<CrmTypes.FeignClientCrmImplementation> {}
