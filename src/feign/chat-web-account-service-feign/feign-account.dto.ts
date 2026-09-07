import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsString } from 'class-validator'

/** 账号展示摘要的 Feign 响应文档模型。 */
export class AccountUserSummaryResponseDto {
    @ApiProperty({ description: '账号 UID', example: '2149446185344106496' })
    uid: string

    @ApiProperty({ description: '账号工号', example: 'A00001' })
    number: string

    @ApiProperty({ description: '账号姓名', example: '张三' })
    name: string

    @ApiProperty({ description: '账号头像', required: false, example: 'https://cdn.example.com/avatar.png' })
    avatar?: string
}

/**
 * 批量还原账号展示摘要的请求体。
 *
 * 该接口只返回展示所需的最小字段，不做权限码校验和数据范围过滤，因此必须限制单次
 * 查询数量，避免被用于批量导出账号信息。
 */
export class AccountUserBatchDto {
    @ApiProperty({ description: '待查询的账号 UID 集合', type: String, isArray: true, example: ['2149446185344106496'] })
    @IsArray({ message: '账号UID集合必须是数组' })
    @ArrayNotEmpty({ message: '账号UID集合不能为空' })
    @ArrayMaxSize(100, { message: '账号UID集合单次最多100个' })
    @IsString({ each: true, message: '账号UID必须是字符串' })
    uids: string[]
}
