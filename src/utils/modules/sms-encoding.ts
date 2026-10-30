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
export function resolveSmsEncoding(content: string): SmsEncoding {
    for (const char of content) {
        if (!GSM7_CHARS.has(char)) return 'UCS2'
    }
    return 'GSM7'
}

/**
 * 按编码和字符数计算计费条数。
 * GSM7 单条 160、长短信每段 153；UCS2 单条 70、长短信每段 67。
 */
export function resolveSmsSegments(contentLength: number, encoding: SmsEncoding): number {
    const length = Number.isFinite(contentLength) && contentLength > 0 ? Math.floor(contentLength) : 0
    const single = encoding === 'GSM7' ? GSM7_SINGLE : UCS2_SINGLE
    const multi = encoding === 'GSM7' ? GSM7_MULTI : UCS2_MULTI
    if (length <= single) return 1
    return Math.ceil(length / multi)
}
