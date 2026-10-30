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
export function generateSnowflakeId(): string {
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
