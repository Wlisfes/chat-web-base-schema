import type { Omix } from '@/types'

/** Observe TCP 服务的消息模式：Dispatch 作为客户端调用，Observe 作为服务端响应。 */
export const OBSERVE_PATTERN = {
    /** 连通性检查。 */
    PING: 'observe.ping',
    /** 提交短信做模拟发送。 */
    SUBMIT: 'observe.sms.submit'
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

/** Dispatch 提交给 Observe 的模拟发送请求：只传定位信息，Observe 自己查询 SRM 库。 */
export interface ObserveSubmitPayload extends Omix {
    /** 短信ID：SMS 提交时生成。 */
    msgId: string
    /** 发送记录主键：tb_srm_simbank_message.key_id。 */
    msgKeyId: number
    /** 发送设备主键：tb_srm_simbank.key_id。 */
    simbankKeyId: number
    /** 发送端口主键：tb_srm_simbank_port.key_id。 */
    portKeyId: number
}

/** 模拟发送结果状态：与 tb_srm_simbank_message.send_status 的 success、failed 一致。 */
export type ObserveSubmitStatus = 'success' | 'failed'

/** 模拟发送结果码，写入 tb_srm_simbank_message.status_code。 */
export const OBSERVE_SUBMIT_CODE = {
    /** 发送成功。 */
    OK: 'OK',
    /** 请求参数不完整。 */
    INVALID_PAYLOAD: 'INVALID_PAYLOAD',
    /** 发送记录不存在或 msgId 不匹配。 */
    MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
    /** 发送记录的设备、端口与请求不一致。 */
    MESSAGE_MISMATCH: 'MESSAGE_MISMATCH',
    /** 设备不存在。 */
    SIMBANK_NOT_FOUND: 'SIMBANK_NOT_FOUND',
    /** 设备已停用。 */
    SIMBANK_DISABLED: 'SIMBANK_DISABLED',
    /** 设备离线。 */
    SIMBANK_OFFLINE: 'SIMBANK_OFFLINE',
    /** 端口不存在或不属于该设备。 */
    PORT_NOT_FOUND: 'PORT_NOT_FOUND',
    /** 端口已停用。 */
    PORT_DISABLED: 'PORT_DISABLED',
    /** 端口未插卡。 */
    PORT_REMOVED: 'PORT_REMOVED',
    /** 端口未激活。 */
    PORT_INACTIVE: 'PORT_INACTIVE',
    /** 端口离线。 */
    PORT_OFFLINE: 'PORT_OFFLINE',
    /** 按 Nacos simulate.failureRate 随机模拟的发送失败。 */
    SIMULATED_FAILURE: 'SIMULATED_FAILURE'
} as const

export type ObserveSubmitCode = (typeof OBSERVE_SUBMIT_CODE)[keyof typeof OBSERVE_SUBMIT_CODE]

/** Observe 模拟发送结果。 */
export interface ObserveSubmitResult extends Omix {
    /** 短信ID，原样返回。 */
    msgId: string
    /** 发送结果。 */
    sendStatus: ObserveSubmitStatus
    /** 结果码。 */
    statusCode: ObserveSubmitCode
    /** 结果说明。 */
    statusMessage: string
    /** Observe 完成发送的时间，ISO-8601。 */
    sendTime: string
}
