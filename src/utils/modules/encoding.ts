/** GSM 03.38 基本字符集和扩展字符集；全部落在这里才是 GSM7。 */
const GSM7_CHARS = new Set(
    '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\u001bÆæßÉ !"#$¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà^{}\\[~]|€'
)

const GSM7_SINGLE = 160
const GSM7_MULTI = 153
const UCS2_SINGLE = 70
const UCS2_MULTI = 67

/** 短信编码：纯 GSM7 字符集为 GSM7，否则为 UCS2。 */
export type SmsEncoding = 'GSM7' | 'UCS2'

/** 按内容判断编码。含 GSM7 字符集以外的字符时使用 UCS2。 */
export function encodingResolve(content: string): SmsEncoding {
    for (const char of content) {
        if (!GSM7_CHARS.has(char)) return 'UCS2'
    }
    return 'GSM7'
}

/**
 * 按编码和字符数计算计费条数。
 * GSM7 单条 160、长短信每段 153；UCS2 单条 70、长短信每段 67。
 */
export function segmentsResolve(contentLength: number, encoding: SmsEncoding): number {
    const length = Number.isFinite(contentLength) && contentLength > 0 ? Math.floor(contentLength) : 0
    const single = encoding === 'GSM7' ? GSM7_SINGLE : UCS2_SINGLE
    const multi = encoding === 'GSM7' ? GSM7_MULTI : UCS2_MULTI
    if (length <= single) return 1
    return Math.ceil(length / multi)
}

import { randomInt } from 'node:crypto'

/** 2024-01-01T00:00:00.000Z，避免时间戳占满 41 位后超出 19 位十进制。 */
const EPOCH = 1704067200000n
const WORKER_ID_BITS = 10n
const SEQUENCE_BITS = 12n
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n
const workerId = BigInt(randomInt(0, 1 << Number(WORKER_ID_BITS)))

let sequence = 0n
let lastTimestamp = -1n

function currentTime(): bigint {
    return BigInt(Date.now())
}

function waitUntil(timestamp: bigint): bigint {
    let next = currentTime()
    while (next <= timestamp) next = currentTime()
    return next
}

/** 生成数字字符串雪花 ID：时间戳、实例号、毫秒内序列，同一进程内单调递增。 */
export function snowflakeResolve(): string {
    let timestamp = currentTime()
    if (timestamp < lastTimestamp) timestamp = waitUntil(lastTimestamp)
    if (timestamp === lastTimestamp) {
        sequence = (sequence + 1n) & MAX_SEQUENCE
        if (sequence === 0n) timestamp = waitUntil(timestamp)
    } else {
        sequence = 0n
    }
    lastTimestamp = timestamp
    const elapsed = timestamp - EPOCH
    const id = (elapsed << (WORKER_ID_BITS + SEQUENCE_BITS)) | (workerId << SEQUENCE_BITS) | sequence
    return id.toString()
}
