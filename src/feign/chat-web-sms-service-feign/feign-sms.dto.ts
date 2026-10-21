import { ApiProperty, PickType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator'
import * as Schema from '@/schema/chat-web-sms-mysql'

/** 按客户统计短信应用数量的服务间请求。 */
export class SmsAppCountResolverRequestDto extends PickType(Schema.TbSmsAppDto, ['userKeyId'] as const) {}

/** 按客户统计短信应用数量的服务间响应。 */
export class SmsAppCountResponseDto extends PickType(Schema.TbSmsAppDto, ['userKeyId'] as const) {
    @ApiProperty({ description: '短信应用数量', example: 3 })
    total: number
}

/** 按短信应用主键批量查询摘要的服务间请求，单次最多 100 个，不存在的主键直接忽略。 */
export class SmsColumnAppResolverRequestDto {
    @ApiProperty({ description: '短信应用主键集合', type: Number, isArray: true, example: [1001] })
    @IsArray({ message: '短信应用主键集合必须是数组' })
    @ArrayNotEmpty({ message: '短信应用主键集合不能为空' })
    @ArrayMaxSize(100, { message: '短信应用主键集合单次最多100个' })
    @Type(() => Number)
    @IsInt({ each: true, message: '短信应用主键必须是整数' })
    @Min(1, { each: true, message: '短信应用主键必须大于0' })
    keyIds: number[]
}

/** 短信应用摘要服务间响应：不包含应用密钥和推送地址。 */
export class SmsAppSummaryResponseDto extends PickType(Schema.TbSmsAppDto, [
    'keyId',
    'userKeyId',
    'appId',
    'appName',
    'appAlias',
    'type',
    'status'
] as const) {}
