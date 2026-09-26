import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString, Matches } from 'class-validator'
import { TbAccountUserEmploymentStatus, TbAccountUserStatus } from '@/schema/chat-web-account-mysql'
import { ACCOUNT_USER_RESOLVER_FIELDS } from './feign-account.constants'
import type * as AccountTypes from './feign-account.interface'

/** 账号展示摘要的 Feign 响应文档模型；除 uid 外的字段都按请求 fields 返回。 */
export class AccountUserSummaryResponseDto {
    @ApiProperty({ description: '账号 UID', example: '2149446185344106496' })
    uid: string

    @ApiProperty({ description: '账号工号，默认返回', required: false, example: 'A00001' })
    number?: string

    @ApiProperty({ description: '账号姓名，默认返回', required: false, example: '张三' })
    name?: string

    @ApiProperty({ description: '账号头像，默认返回', required: false, example: 'https://cdn.example.com/avatar.png' })
    avatar?: string

    @ApiProperty({ description: '账号手机号，仅请求 phone 时返回', required: false, example: '13800000000' })
    phone?: string

    @ApiProperty({ description: '账号邮箱，仅请求 email 时返回', required: false, example: 'zhangsan@example.com' })
    email?: string

    @ApiProperty({ description: '账号状态，仅请求 status 时返回', required: false, enum: TbAccountUserStatus, example: 'enabled' })
    status?: TbAccountUserStatus

    @ApiProperty({
        description: '员工在职状态，仅请求 employmentStatus 时返回',
        required: false,
        enum: TbAccountUserEmploymentStatus,
        example: 'employed'
    })
    employmentStatus?: TbAccountUserEmploymentStatus
}

/** 列表操作人展示选项的响应文档模型；字段集合与请求 fields 一致，账号不存在时只返回 uid。 */
export class AccountUserOptionResponseDto extends AccountUserSummaryResponseDto {}

/** 账号还原请求中可选的返回字段声明。 */
class AccountUserFieldsDto {
    @ApiProperty({
        description: '需要返回的账号字段，缺省返回 uid、number、name、avatar；uid 始终返回',
        required: false,
        enum: ACCOUNT_USER_RESOLVER_FIELDS,
        isArray: true,
        example: ['uid', 'number', 'name', 'avatar']
    })
    @IsOptional()
    @IsArray({ message: '账号返回字段必须是数组' })
    @IsIn(ACCOUNT_USER_RESOLVER_FIELDS, { each: true, message: '账号返回字段不在允许范围内' })
    fields?: AccountTypes.AccountUserField[]
}

/**
 * 按列表批量还原账号展示摘要的请求体。
 *
 * 该接口只返回白名单中的展示字段，不做权限码校验和数据范围过滤，因此必须限制单次
 * 查询数量，避免被用于批量导出账号信息。
 */
export class AccountColumnUserResolverDto extends AccountUserFieldsDto {
    @ApiProperty({ description: '待查询的账号 UID 集合', type: String, isArray: true, example: ['2149446185344106496'] })
    @IsArray({ message: '账号UID集合必须是数组' })
    @ArrayNotEmpty({ message: '账号UID集合不能为空' })
    @ArrayMaxSize(100, { message: '账号UID集合单次最多100个' })
    @IsString({ each: true, message: '账号UID必须是字符串' })
    uids: string[]
}

/** 按账号 UID 还原单个展示摘要的请求体。 */
export class AccountUserResolverDto extends AccountUserFieldsDto {
    @ApiProperty({ description: '待查询的账号 UID', example: '2149446185344106496' })
    @IsString({ message: '账号UID必须是字符串' })
    @Matches(/^\d{1,19}$/, { message: '账号UID必须是1-19位数字字符串' })
    uid: string
}
