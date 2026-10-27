import type { Omix } from '@/types'

/** Observe TCP 服务的消息模式：Dispatch 作为客户端调用，Observe 作为服务端响应。 */
export const OBSERVE_PATTERN = {
    /** 连通性检查。 */
    PING: 'observe.ping'
} as const

/** Nacos 中 Dispatch 连接 Observe 的配置节点 `observe`。 */
export interface ObserveClientConfig extends Omix {
    /** Observe TCP 地址：Docker 内为容器名 chat-web-observe-service。 */
    host: string
    /** Observe TCP 端口。 */
    port: number
    /** 单次调用超时毫秒数，默认 5000。 */
    timeout?: number
}

/** 连通性检查请求。 */
export interface ObservePingPayload extends Omix {
    /** 调用方服务名称。 */
    from: string
    /** 调用方发起时间，ISO-8601。 */
    timestamp: string
}

/** 连通性检查响应。 */
export interface ObservePingResult extends Omix {
    /** 响应的服务名称。 */
    service: string
    /** 调用方服务名称，原样返回。 */
    from: string
    /** Observe 响应时间，ISO-8601。 */
    timestamp: string
}
