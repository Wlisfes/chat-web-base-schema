import { ApiProperty, PickType } from '@nestjs/swagger'
import * as Schema from '@/schema/chat-web-sms-mysql'

/** 按客户统计短信应用数量的服务间请求。 */
export class SmsAppCountResolverRequestDto extends PickType(Schema.TbSmsAppDto, ['userKeyId'] as const) {}

/** 按客户统计短信应用数量的服务间响应。 */
export class SmsAppCountResponseDto extends PickType(Schema.TbSmsAppDto, ['userKeyId'] as const) {
    @ApiProperty({ description: '短信应用数量', example: 3 })
    total: number
}
