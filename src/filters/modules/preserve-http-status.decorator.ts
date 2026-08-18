import { SetMetadata } from '@nestjs/common'

export const PRESERVE_HTTP_STATUS_METADATA = 'chat-web:preserve-http-status'

/** 仅用于健康检查、Webhook 等依赖原生 HTTP 状态的协议型接口。 */
export const PreserveHttpStatus = () => SetMetadata(PRESERVE_HTTP_STATUS_METADATA, true)
