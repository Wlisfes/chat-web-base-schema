import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'
import { TbSmsAppType, TbSmsAppTypeDefinition } from '@/schema/chat-web-sms-mysql'

export enum TbSrmChannelColumn {
    KEY_ID = 'key_id',
    ALIAS = 'alias',
    TYPE = 'type',
    COUNTRY_KEY_ID = 'country_key_id',
    OWNER_USER_UID = 'owner_user_uid',
    SEND_INTERVAL = 'send_interval',
    MAX_RETRY = 'max_retry',
    STATUS = 'status',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 通道短信类型直接使用短信应用类型 TbSmsAppType，通道只承载同类型的短信。 */
export enum TbSrmChannelStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmChannelStatusDefinition = defineEnumMetadata(TbSrmChannelStatus, '通道状态', {
    [TbSrmChannelStatus.DISABLE]: { label: '停用', description: '通道暂停消费，消息保留在通道队列', type: 'error' },
    [TbSrmChannelStatus.ENABLE]: { label: '启用', description: '通道正常接收和消费消息', type: 'success' }
})

export class TbSrmChannelDto extends DataBaseByDto {
    @ApiProperty({
        description:
            '通道别名：创建时按 创建人工号-方向MCC-类型-序号 自动生成（如 1024-460-MRKT-01），全表唯一，创建后不可修改，用于队列命名',
        example: '1024-460-MRKT-01'
    })
    @IsString({ message: '通道别名必须是字符串' })
    @Matches(/^[A-Za-z0-9][A-Za-z0-9-]{1,31}$/, { message: '通道别名只能包含字母、数字和中划线，长度2-32位' })
    alias: string

    @ApiProperty({
        description: TbSmsAppTypeDefinition.comment,
        enum: TbSmsAppType,
        enumName: 'TbSmsAppType',
        example: TbSmsAppType.MRKT
    })
    @IsEnum(TbSmsAppType, { message: '短信类型格式错误' })
    type: TbSmsAppType

    @ApiProperty({
        description: '方向：Skyline 国家/地区主键；通道只发送该方向的短信，只能绑定该方向激活的端口，只能加入同方向的路由，创建后不可修改',
        example: 1007
    })
    @Type(() => Number)
    @IsInt({ message: '方向必须是整数' })
    @Min(1, { message: '方向必须大于0' })
    countryKeyId: number

    @ApiProperty({ description: '负责人账号UID：当前负责该通道的员工，可修改', example: '2149446185344106496' })
    @IsString({ message: '负责人账号UID必须是字符串' })
    @Length(1, 19, { message: '负责人账号UID长度不能超过19位' })
    ownerUserUid: string

    @ApiProperty({ description: '端口发送间隔：同一端口两条短信之间的最小间隔毫秒数', example: 3000 })
    @Type(() => Number)
    @IsInt({ message: '端口发送间隔必须是整数' })
    @Min(0, { message: '端口发送间隔不能小于0' })
    @Max(600000, { message: '端口发送间隔不能大于600000毫秒' })
    sendInterval: number

    @ApiProperty({ description: '最大重试次数：无可用端口或下发失败时的重试上限', example: 3 })
    @Type(() => Number)
    @IsInt({ message: '最大重试次数必须是整数' })
    @Min(0, { message: '最大重试次数不能小于0' })
    @Max(20, { message: '最大重试次数不能大于20' })
    maxRetry: number

    @ApiProperty({
        description: TbSrmChannelStatusDefinition.comment,
        enum: TbSrmChannelStatus,
        enumName: 'TbSrmChannelStatus',
        example: TbSrmChannelStatus.ENABLE
    })
    @IsEnum(TbSrmChannelStatus, { message: '通道状态格式错误' })
    status: TbSrmChannelStatus

    @ApiProperty({ description: '备注', required: false, example: '主营香港营销短信' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(512, { message: '备注长度不能超过512位' })
    remark: string
}

@Index('uk_tb_srm_channel_alias', ['alias'], { unique: true })
@Index('idx_tb_srm_channel_country_type', ['countryKeyId', 'type'])
@Index('idx_tb_srm_channel_owner_user_uid', ['ownerUserUid'])
@Index('idx_tb_srm_channel_status', ['status'])
@Entity({ name: 'tb_srm_channel', comment: 'SRM 短信通道表' })
export class TbSrmChannel extends DataBaseByAdapter {
    @Column({
        name: TbSrmChannelColumn.ALIAS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: '通道别名：按 创建人工号-方向MCC-类型-序号 自动生成，全表唯一，创建后不可修改，用于队列命名'
    })
    alias: string

    @Column({
        name: TbSrmChannelColumn.TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSmsAppTypeDefinition.comment
    })
    type: TbSmsAppType

    @Column({
        name: TbSrmChannelColumn.COUNTRY_KEY_ID,
        type: 'int',
        nullable: false,
        comment: '方向：Skyline 国家/地区主键，创建后不可修改'
    })
    countryKeyId: number

    @Column({ name: TbSrmChannelColumn.OWNER_USER_UID, type: 'varchar', length: 19, nullable: false, comment: '负责人账号UID' })
    ownerUserUid: string

    @Column({
        name: TbSrmChannelColumn.SEND_INTERVAL,
        type: 'int',
        nullable: false,
        default: 3000,
        comment: '端口发送间隔：同一端口两条短信之间的最小间隔毫秒数'
    })
    sendInterval: number

    @Column({
        name: TbSrmChannelColumn.MAX_RETRY,
        type: 'int',
        nullable: false,
        default: 3,
        comment: '最大重试次数：无可用端口或下发失败时的重试上限'
    })
    maxRetry: number

    @Column({
        name: TbSrmChannelColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmChannelStatus.DISABLE,
        comment: TbSrmChannelStatusDefinition.comment
    })
    status: TbSrmChannelStatus

    @Column({ name: TbSrmChannelColumn.REMARK, type: 'varchar', length: 512, nullable: true, comment: '备注' })
    remark: string
}
