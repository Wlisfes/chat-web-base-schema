import { ApiProperty, IntersectionType, PartialType, PickType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import {
    TbCrmConsumerAuthStatus,
    TbCrmConsumerDto,
    TbCrmConsumerPayMode,
    TbCrmConsumerSource,
    TbCrmConsumerStatus
} from '@/schema/chat-web-crm-mysql'
import { PageResponseDataDto } from '@/decorator'
import { PageDto } from '@/utils'

/** CRM 客户服务间响应摘要。 */
export class CrmConsumerResponseDto extends TbCrmConsumerDto {
    @ApiProperty({ description: '财务品牌主键', example: 1 })
    brandId: number
}

/** CRM 客户分页响应。 */
export class CrmConsumerPageResponseDto extends PageResponseDataDto {
    @ApiProperty({ description: '客户列表', type: [CrmConsumerResponseDto] })
    list: CrmConsumerResponseDto[]
}

/** CRM 客户下拉服务间响应。 */
export class CrmConsumerSelectResponseDto {
    @ApiProperty({ description: '客户主键', example: 5181000 })
    keyId: number

    @ApiProperty({ description: '客户 UID', example: '2149446185344106496' })
    uid: string

    @ApiProperty({ description: '归属账号 UID', example: '2149446185344106496' })
    ownerUserUid: string

    @ApiProperty({ description: '客户名称', example: '测试客户' })
    name: string

    @ApiProperty({ description: '客户别名', required: false, example: 'demo' })
    alias?: string

    @ApiProperty({ description: '财务品牌主键', example: 1 })
    brandId: number

    @ApiProperty({ description: '财务币种编码', example: 'USD' })
    currency: string

    @ApiProperty({ description: '邮箱', example: 'consumer@example.com' })
    email: string

    @ApiProperty({ description: '电话号码', required: false, example: '+8613800138000' })
    phone?: string

    @ApiProperty({ description: '客户状态', example: 'enable' })
    status: string
}

/** CRM 客户创建服务间请求。 */
export class CrmCreateConsumerRequestDto {
    @ApiProperty({ description: '归属账号 UID', example: '2149446185344106496' })
    @IsString({ message: '归属账号UID必须是字符串' })
    @MaxLength(19, { message: '归属账号UID长度不能超过19位' })
    ownerUserUid: string

    @ApiProperty({ description: '客户名称', example: '测试客户' })
    @IsString({ message: '客户名称必须是字符串' })
    @IsNotEmpty({ message: '客户名称必填' })
    @MaxLength(64, { message: '客户名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '客户别名', required: false, example: '测试客户别名' })
    @IsOptional()
    @IsString({ message: '客户别名必须是字符串' })
    @MaxLength(64, { message: '客户别名长度不能超过64位' })
    alias?: string

    @ApiProperty({ description: '财务品牌主键', example: 1 })
    @Type(() => Number)
    @IsInt({ message: '财务品牌主键必须是整数' })
    @Min(1, { message: '财务品牌主键必须大于0' })
    brandId: number

    @ApiProperty({ description: '财务币种编码', example: 'USD' })
    @IsString({ message: '财务币种编码必须是字符串' })
    @MaxLength(16, { message: '财务币种编码长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '邮箱', example: 'consumer@example.com' })
    @IsString({ message: '邮箱必须是字符串' })
    @MaxLength(128, { message: '邮箱长度不能超过128位' })
    email: string

    @ApiProperty({ description: '电话号码', required: false, example: '+8613800138000' })
    @IsOptional()
    @IsString({ message: '电话号码必须是字符串' })
    @MaxLength(32, { message: '电话号码长度不能超过32位' })
    phone?: string

    @ApiProperty({ description: '客户状态', required: false, enum: TbCrmConsumerStatus, example: TbCrmConsumerStatus.ENABLE })
    @IsOptional()
    @IsEnum(TbCrmConsumerStatus, { message: '客户状态格式错误' })
    status?: TbCrmConsumerStatus

    @ApiProperty({ description: '付款模式', enum: TbCrmConsumerPayMode, example: TbCrmConsumerPayMode.PREPAID })
    @IsEnum(TbCrmConsumerPayMode, { message: '付款模式格式错误' })
    payMode: TbCrmConsumerPayMode

    @ApiProperty({ description: '认证状态', required: false, enum: TbCrmConsumerAuthStatus, example: TbCrmConsumerAuthStatus.UNVERIFIED })
    @IsOptional()
    @IsEnum(TbCrmConsumerAuthStatus, { message: '认证状态格式错误' })
    authStatus?: TbCrmConsumerAuthStatus

    @ApiProperty({ description: '注册来源', required: false, enum: TbCrmConsumerSource, example: TbCrmConsumerSource.MANUAL })
    @IsOptional()
    @IsEnum(TbCrmConsumerSource, { message: '注册来源格式错误' })
    source?: TbCrmConsumerSource

    @ApiProperty({ description: '备注', required: false, example: '重点跟进客户' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark?: string
}

/** CRM 客户更新服务间请求。 */
export class CrmUpdateConsumerRequestDto extends CrmCreateConsumerRequestDto {
    @ApiProperty({ description: '客户主键', example: 5181000 })
    @Type(() => Number)
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    keyId: number
}

/** CRM 客户状态更新服务间请求。 */
export class CrmUpdateConsumerStatusRequestDto extends PickType(TbCrmConsumerDto, ['status'] as const) {
    @ApiProperty({ description: '客户主键', example: 5181000 })
    @Type(() => Number)
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    keyId: number
}

/** CRM 客户详情服务间请求。 */
export class CrmResolveConsumerRequestDto extends PickType(TbCrmConsumerDto, ['keyId'] as const) {
    @ApiProperty({ description: '客户主键', example: 5181000 })
    @Type(() => Number)
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    keyId: number
}

/** CRM 客户下拉服务间请求。 */
export class CrmSelectConsumerRequestDto extends PartialType(PickType(TbCrmConsumerDto, ['name'] as const)) {}

/** CRM 客户分页服务间请求。 */
export class CrmListConsumerRequestDto extends IntersectionType(
    PageDto,
    PartialType(PickType(TbCrmConsumerDto, ['name', 'status', 'currency', 'payMode', 'authStatus', 'source'] as const))
) {
    @ApiProperty({ description: '财务品牌主键', required: false, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: '财务品牌主键必须是整数' })
    @Min(1, { message: '财务品牌主键必须大于0' })
    brandId?: number
}
