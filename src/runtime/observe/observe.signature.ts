import { createHmac, timingSafeEqual } from 'node:crypto'

/** 回执签名请求头：HMAC-SHA256(secret, timestamp + '.' + body) 的十六进制值。 */
export const SIMBANK_WEBHOOK_SIGNATURE_HEADER = 'x-simbank-webhook-signature'
/** 回执签名时间戳请求头：毫秒数，Hooks 拒绝超出有效期的请求，防止重放。 */
export const SIMBANK_WEBHOOK_TIMESTAMP_HEADER = 'x-simbank-webhook-timestamp'
/** 回执签名默认有效期：5 分钟。 */
export const SIMBANK_WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000

/** 计算回执签名；body 必须是实际发送的 JSON 原文。 */
export function signSimbankWebhook(secret: string, timestamp: string | number, body: string): string {
    return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
}

/** 校验回执签名和时间戳；密钥为空、签名不一致或时间戳超出有效期都返回 false。 */
export function verifySimbankWebhook(options: {
    secret: string
    timestamp: string | undefined
    signature: string | undefined
    body: string
    now?: number
    maxAgeMs?: number
}): boolean {
    const { secret, timestamp, signature, body, now = Date.now(), maxAgeMs = SIMBANK_WEBHOOK_MAX_AGE_MS } = options
    if (!secret || !timestamp || !signature) return false
    const time = Number(timestamp)
    if (!Number.isFinite(time) || Math.abs(now - time) > maxAgeMs) return false
    const expected = Buffer.from(signSimbankWebhook(secret, timestamp, body), 'hex')
    const actual = Buffer.from(signature, 'hex')
    return expected.length === actual.length && timingSafeEqual(expected, actual)
}
