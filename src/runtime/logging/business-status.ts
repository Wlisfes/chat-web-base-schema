import { HttpStatus } from '@nestjs/common'

/** 与响应体 code 对齐的业务状态码响应头，供网关和请求日志在 HTTP 200 包装下识别真实结果。 */
export const BUSINESS_CODE_HEADER = 'x-business-code'

function firstHeaderValue(value: unknown): string {
    const raw = Array.isArray(value) ? value[0] : value
    if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw)
    return typeof raw === 'string' ? raw.trim() : ''
}

/** 解析业务状态码，非法值视为未提供。 */
export function parseBusinessStatusCode(value: unknown): number | undefined {
    const text = firstHeaderValue(value)
    if (!text) return undefined
    const code = Number(text)
    return Number.isInteger(code) ? code : undefined
}

/** 从统一 API JSON 中提取 code；响应体被截断时回退正则。 */
export function parseJsonBusinessCode(text: string): number | undefined {
    const trimmed = text.trim()
    if (!trimmed.includes('{')) return undefined

    try {
        const parsed = JSON.parse(trimmed) as { code?: unknown }
        const code = parseBusinessStatusCode(parsed.code)
        if (code !== undefined) return code
    } catch {
        // 响应体可能尚未完整，继续从片段中提取 code
    }

    const match = trimmed.match(/"code"\s*:\s*(-?\d+)/)
    return match ? parseBusinessStatusCode(match[1]) : undefined
}

/** 写入业务状态码响应头，供下游日志按自定义 code 判定级别。 */
export function setBusinessCodeHeader(
    response: { headersSent?: boolean; setHeader(name: string, value: string): unknown },
    code: number
): void {
    if (response.headersSent) return
    response.setHeader(BUSINESS_CODE_HEADER, String(code))
}

/** 优先读取业务码响应头，其次使用已捕获的响应体 code，最后回退 HTTP status。 */
export function resolveBusinessStatusCode(
    response: { statusCode?: number; getHeader?(name: string): unknown },
    capturedCode?: number
): number {
    return parseBusinessStatusCode(response.getHeader?.(BUSINESS_CODE_HEADER)) ?? capturedCode ?? response.statusCode ?? HttpStatus.OK
}

/** 自定义业务码非 200 一律视为错误。 */
export function isBusinessSuccessStatus(code: number): boolean {
    return code === HttpStatus.OK
}
