import type { Omix } from '@/types'

/** Observe TCP 服务的消息模式：Dispatch 作为客户端调用，Observe 作为服务端响应。 */
export const OBSERVE_PATTERN = {
    /** 连通性检查。 */
    PING: 'observe.ping',
    /** 提交短信做模拟发送，等待发送完成后返回结果（同步，兼容旧版 Dispatch）。 */
    SUBMIT: 'observe.sms.submit',
    /** 提交短信进入端口发送队列，立即返回受理结果；发送完成后 Observe 通过 Hooks 回执结果（异步）。 */
    ENQUEUE: 'observe.sms.enqueue',
    /** 按短信ID查询设备侧发送状态：重投时先查询，已发送过的短信不再重复发送。 */
    QUERY: 'observe.sms.query'
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
    /** 同一端口两条短信之间的最小间隔毫秒数：取通道 tb_srm_channel.send_interval；未传时不限速。 */
    sendInterval?: number
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
    SIMULATED_FAILURE: 'SIMULATED_FAILURE',
    /** 已进入端口发送队列，等待发送。 */
    QUEUED: 'QUEUED',
    /** 端口发送队列已满，Dispatch 应换一个端口提交。 */
    PORT_BUSY: 'PORT_BUSY'
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

/** 按短信ID查询设备侧发送状态的请求。 */
export interface ObserveQueryPayload extends Omix {
    /** 短信ID：SMS 提交时生成。 */
    msgId: string
}

/** 设备侧短信状态：queued 排队中、sending 发送中、settled 已有发送结果。 */
export type ObserveMessageState = 'queued' | 'sending' | 'settled'

/**
 * 设备侧发送状态查询结果，立即返回不等待发送完成。
 * found=false 表示设备没有收到过这条短信，可以安全提交；queued、sending 表示设备已受理，不能重复提交；settled 时 result 为发送结果。
 */
export interface ObserveQueryResult extends Omix {
    /** 短信ID，原样返回。 */
    msgId: string
    /** 设备是否收到过这条短信。 */
    found: boolean
    /** 设备侧状态；found=false 时为空。 */
    state?: ObserveMessageState
    /** 设备是否受理过这条短信（进入过端口发送队列）；发送条件不满足被拒绝时为 false。供应商预付在受理时计费。 */
    accepted?: boolean
    /** 设备当时的发送结果；state=settled 时才有。 */
    result?: ObserveSubmitResult
}

/**
 * 异步提交的受理结果。
 * accepted=true 表示已进入端口发送队列（或同一短信ID此前已受理），发送结果稍后通过回执送达；
 * accepted=false 时 statusCode 为 PORT_BUSY 表示端口队列已满，应换端口重试，其余为发送条件不满足，短信不会发送。
 */
export interface ObserveEnqueueResult extends Omix {
    /** 短信ID，原样返回。 */
    msgId: string
    /** 是否受理。 */
    accepted: boolean
    /** 受理结果码：受理为 QUEUED，拒绝为具体原因。 */
    statusCode: ObserveSubmitCode
    /** 结果说明。 */
    statusMessage: string
    /** 受理时该端口队列中等待发送的短信数（含本条）。 */
    queueSize?: number
    /** 受理时间，ISO-8601。 */
    time: string
}

/** Observe 发送完成后推送给 Hooks 的回执：发送结果 + 定位信息。Hooks 校验签名后原样转发到回执队列，由 Dispatch 写回发送记录。 */
export interface SimbankWebhookPayload extends ObserveSubmitResult {
    /** 发送记录主键：tb_srm_simbank_message.key_id。 */
    msgKeyId: number
    /** 发送设备主键。 */
    simbankKeyId: number
    /** 发送端口主键。 */
    portKeyId: number
}

/** Observe 推送回执的 Nacos 配置节点 `hooks`。 */
export interface ObserveHooksConfig extends Omix {
    /** Hooks 回执地址，Docker 内为 http://chat-web-hooks-service:5110/observe/simbank/webhook。 */
    url: string
    /** 回执签名密钥，必须与 Hooks Nacos `simbank.secret` 一致。 */
    secret: string
    /** 单次推送超时毫秒数，默认 5000。 */
    timeout?: number
}
