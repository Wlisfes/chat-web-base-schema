interface RequestUrlLike {
    originalUrl?: string
    url?: string
    headers?: Record<string, unknown>
}

const FORWARDED_PREFIX_PATTERN = /^\/[A-Za-z0-9._~/-]*$/

function resolveForwardedPrefix(value: unknown): string {
    const candidate = Array.isArray(value) ? value[0] : value
    if (typeof candidate !== 'string') return ''

    const prefix = candidate.split(',')[0].trim().replace(/\/+$/, '')
    return prefix && FORWARDED_PREFIX_PATTERN.test(prefix) && !prefix.includes('..') ? prefix : ''
}

/** 将网关转发前缀还原到服务内请求地址，得到前端实际访问的完整 API 路径。 */
export function resolvePublicRequestUrl(request: RequestUrlLike): string {
    const requestUrl = request.originalUrl ?? request.url ?? '/'
    const normalizedUrl = requestUrl.startsWith('/') ? requestUrl : `/${requestUrl}`
    const prefix = resolveForwardedPrefix(request.headers?.['x-forwarded-prefix'])
    if (!prefix) return normalizedUrl

    const queryIndex = normalizedUrl.indexOf('?')
    const pathname = queryIndex >= 0 ? normalizedUrl.slice(0, queryIndex) : normalizedUrl
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return normalizedUrl

    return `${prefix}${normalizedUrl}`
}
