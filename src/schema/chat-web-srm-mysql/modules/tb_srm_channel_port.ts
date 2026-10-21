import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, Max, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbSrmChannelPortColumn {
    KEY_ID = 'key_id',
    CHANNEL_KEY_ID = 'channel_key_id',
    PORT_KEY_ID = 'port_key_id',
    SIMBANK_KEY_ID = 'simbank_key_id',
    WEIGHT = 'weight',
    STATUS = 'status',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmChannelPortStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmChannelPortStatusDefinition = defineEnumMetadata(TbSrmChannelPortStatus, '绑定状态', {
    [TbSrmChannelPortStatus.DISABLE]: { label: '停用', description: '端口暂不参与该通道发送', type: 'error' },
    [TbSrmChannelPortStatus.ENABLE]: { label: '启用', description: '端口参与该通道发送', type: 'success' }
})

export class TbSrmChannelPortDto extends DataBaseByDto {
    @ApiProperty({ description: '通道ID：SRM 通道主键', example: 1001 })
    @Type(() => Number)
    @IsInt({ message: '通道ID必须是整数' })
    @Min(1, { message: '通道ID必须大于0' })
    channelKeyId: number

    @ApiProperty({ description: '端口ID：SRM SIMBANK 端口主键；一个端口只能绑定一个通道', example: 1002401 })
    @Type(() => Number)
    @IsInt({ message: '端口ID必须是整数' })
    @Min(1, { message: '端口ID必须大于0' })
    portKeyId: number

    @ApiProperty({ description: '设备ID：端口所属 SRM SIMBANK 设备主键，冗余便于按设备查询', example: 100201 })
    @Type(() => Number)
    @IsInt({ message: '设备ID必须是整数' })
    @Min(1, { message: '设备ID必须大于0' })
    simbankKeyId: number

    @ApiProperty({ description: '端口权重：同一通道内按权重选择端口，越大分到的消息越多', example: 1 })
    @Type(() => Number)
    @IsInt({ message: '端口权重必须是整数' })
    @Min(1, { message: '端口权重不能小于1' })
    @Max(100, { message: '端口权重不能大于100' })
    weight: number

    @ApiProperty({
        description: TbSrmChannelPortStatusDefinition.comment,
        enum: TbSrmChannelPortStatus,
        enumName: 'TbSrmChannelPortStatus',
        example: TbSrmChannelPortStatus.ENABLE
    })
    @IsEnum(TbSrmChannelPortStatus, { message: '绑定状态格式错误' })
    status: TbSrmChannelPortStatus
}

@Index('uk_tb_srm_channel_port_port_key_id', ['portKeyId'], { unique: true })
@Index('idx_tb_srm_channel_port_channel_key_id', ['channelKeyId'])
@Index('idx_tb_srm_channel_port_simbank_key_id', ['simbankKeyId'])
@Entity({ name: 'tb_srm_channel_port', comment: 'SRM 通道端口绑定表' })
export class TbSrmChannelPort extends DataBaseByAdapter {
    @Column({ name: TbSrmChannelPortColumn.CHANNEL_KEY_ID, type: 'int', nullable: false, comment: '通道ID：SRM 通道主键' })
    channelKeyId: number

    @Column({
        name: TbSrmChannelPortColumn.PORT_KEY_ID,
        type: 'int',
        nullable: false,
        comment: '端口ID：SRM SIMBANK 端口主键；一个端口只能绑定一个通道'
    })
    portKeyId: number

    @Column({ name: TbSrmChannelPortColumn.SIMBANK_KEY_ID, type: 'int', nullable: false, comment: '设备ID：端口所属 SRM SIMBANK 设备主键' })
    simbankKeyId: number

    @Column({
        name: TbSrmChannelPortColumn.WEIGHT,
        type: 'int',
        nullable: false,
        default: 1,
        comment: '端口权重：同一通道内按权重选择端口'
    })
    weight: number

    @Column({
        name: TbSrmChannelPortColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmChannelPortStatus.ENABLE,
        comment: TbSrmChannelPortStatusDefinition.comment
    })
    status: TbSrmChannelPortStatus
}
