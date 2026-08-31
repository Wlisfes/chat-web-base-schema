import { HttpStatus } from '@nestjs/common'
import type { ApiResponse, ApiResponseOptions } from '@/types'
import { moment } from '@/utils/modules/common'
import { getActiveRequestId, resolveRequestId } from '@/utils/modules/request-context'

const RESPONSE_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss'

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function resolveSuccessMessage(data: unknown): string {
    if (!isRecord(data)) {
        return 'success'
    }
    const message = data.message
    return typeof message === 'string' && message.trim().length > 0 ? message : 'success'
}

/** 创建前后端统一 API 响应。 */
export function createApiResponse<T = unknown>(data: T, options: ApiResponseOptions = {}): ApiResponse<T> {
    return {
        data: data ?? null,
        code: options.code ?? HttpStatus.OK,
        message: options.message ?? resolveSuccessMessage(data),
        logId: resolveRequestId(options.logId ?? getActiveRequestId()),
        timestamp: moment().format(RESPONSE_TIMESTAMP_FORMAT)
    }
}

/** 判断返回值是否已经是统一 API 响应，避免被拦截器重复包装。 */
export function isApiResponse(value: unknown): value is ApiResponse {
    return (
        isRecord(value) &&
        'data' in value &&
        typeof value.code === 'number' &&
        typeof value.message === 'string' &&
        typeof value.logId === 'string' &&
        typeof value.timestamp === 'string'
    )
}
