import { HttpAgent } from 'nacos'

/** Nacos 长轮询客户端响应超时，单位毫秒。服务端约 29.5 秒返回，预留公网抖动时间。 */
export const NACOS_LONG_POLLING_RESPONSE_TIMEOUT = 180_000

const NACOS_LISTENER_PATH = '/v1/cs/configs/listener'

/** 仅延长配置长轮询的响应超时，普通配置请求继续使用 requestTimeout。 */
export class NacosLongPollingHttpAgent extends HttpAgent {
    async request(path: string, options: Record<string, any> = {}): Promise<any> {
        if (path === NACOS_LISTENER_PATH && options.method === 'POST') {
            return super.request(path, { ...options, timeout: NACOS_LONG_POLLING_RESPONSE_TIMEOUT })
        }
        return super.request(path, options)
    }
}
