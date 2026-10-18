import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, WithJsonColumn, defineEnumMetadata } from '@/utils'

export enum TbSrmUserContactColumn {
    KEY_ID = 'key_id',
    USER_KEY_ID = 'user_key_id',
    NAME = 'name',
    ITEMS = 'items',
    ADDRESS = 'address',
    STATUS = 'status',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmUserContactStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmUserContactStatusDefinition = defineEnumMetadata(TbSrmUserContactStatus, '联系人状态', {
    [TbSrmUserContactStatus.DISABLE]: { label: '无效', description: '联系人已标记无效', type: 'error' },
    [TbSrmUserContactStatus.ENABLE]: { label: '有效', description: '联系人正常可用', type: 'success' }
})

/** 联系方式项：type 为 Skyline 枚举 CHUNK_SKYLINE_CONTACT_TYPE 的枚举项主键，value 为联系方式内容。 */
export class TbSrmUserContactItemDto {
    @ApiProperty({
        description: '联系方式类型：Skyline 枚举 CHUNK_SKYLINE_CONTACT_TYPE 的枚举项主键，支持数字或数字字符串，入库统一转为数字',
        oneOf: [{ type: 'integer' }, { type: 'string' }],
        example: 1024188
    })
    @Type(() => Number)
    @IsInt({ message: '联系方式类型必须是整数' })
    @Min(1, { message: '联系方式类型必须大于0' })
    type: number | string

    @ApiProperty({ description: '联系方式内容', example: '19rok5@sugtbt.com' })
    @IsString({ message: '联系方式内容必须是字符串' })
    @IsNotEmpty({ message: '联系方式内容必填' })
    @MaxLength(128, { message: '联系方式内容长度不能超过128位' })
    value: string
}

export class TbSrmUserContactDto extends DataBaseByDto {
    @ApiProperty({ description: 'SRM 供应商主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '供应商主键必须是整数' })
    @Min(1, { message: '供应商主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '联系人名称', example: '李逸飞' })
    @IsString({ message: '联系人名称必须是字符串' })
    @IsNotEmpty({ message: '联系人名称必填' })
    @MaxLength(64, { message: '联系人名称长度不能超过64位' })
    name: string

    @ApiProperty({
        description: '联系方式列表',
        type: [TbSrmUserContactItemDto],
        required: false,
        example: [{ type: 1024188, value: '19rok5@sugtbt.com' }]
    })
    @IsOptional()
    @IsArray({ message: '联系方式列表必须是数组' })
    @ArrayMaxSize(50, { message: '联系方式最多50条' })
    @ValidateNested({ each: true })
    @Type(() => TbSrmUserContactItemDto)
    items: Array<TbSrmUserContactItemDto>

    @ApiProperty({ description: '地址', required: false, example: '广东省深圳市龙华区利金城T2栋' })
    @IsOptional()
    @IsString({ message: '地址必须是字符串' })
    @MaxLength(512, { message: '地址长度不能超过512位' })
    address: string

    @ApiProperty({
        description: TbSrmUserContactStatusDefinition.comment,
        enum: TbSrmUserContactStatus,
        enumName: 'TbSrmUserContactStatus',
        example: TbSrmUserContactStatus.ENABLE
    })
    @IsEnum(TbSrmUserContactStatus, { message: '联系人状态格式错误' })
    status: TbSrmUserContactStatus

    @ApiProperty({ description: '备注', required: false, example: '供应商技术对接人' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('idx_tb_srm_user_contact_user_key_id', ['userKeyId'])
@Entity({ name: 'tb_srm_user_contact', comment: 'SRM 供应商联系人表' })
export class TbSrmUserContact extends DataBaseByAdapter {
    @Column({ name: TbSrmUserContactColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'SRM 供应商主键' })
    userKeyId: number

    @Column({ name: TbSrmUserContactColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '联系人名称' })
    name: string

    @WithJsonColumn({
        name: TbSrmUserContactColumn.ITEMS,
        nullable: false,
        comment: '联系方式列表，JSON 数组：[{ type: 联系方式类型枚举项主键, value: 联系方式内容 }]'
    })
    items: Array<TbSrmUserContactItemDto>

    @Column({ name: TbSrmUserContactColumn.ADDRESS, type: 'varchar', length: 512, nullable: true, comment: '地址' })
    address: string

    @Column({
        name: TbSrmUserContactColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmUserContactStatus.ENABLE,
        comment: TbSrmUserContactStatusDefinition.comment
    })
    status: TbSrmUserContactStatus

    @Column({ name: TbSrmUserContactColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
