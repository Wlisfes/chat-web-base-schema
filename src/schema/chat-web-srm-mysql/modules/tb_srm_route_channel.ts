import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, Max, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbSrmRouteChannelColumn {
    KEY_ID = 'key_id',
    RULE_KEY_ID = 'rule_key_id',
    CHANNEL_KEY_ID = 'channel_key_id',
    PRIORITY = 'priority',
    WEIGHT = 'weight',
    STATUS = 'status',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmRouteChannelStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmRouteChannelStatusDefinition = defineEnumMetadata(TbSrmRouteChannelStatus, '路由通道状态', {
    [TbSrmRouteChannelStatus.DISABLE]: { label: '停用', description: '通道暂不参与该规则分流', type: 'error' },
    [TbSrmRouteChannelStatus.ENABLE]: { label: '启用', description: '通道参与该规则分流', type: 'success' }
})

export class TbSrmRouteChannelDto extends DataBaseByDto {
    @ApiProperty({ description: '规则ID：SRM 路由规则主键', example: 1 })
    @Type(() => Number)
    @IsInt({ message: '规则ID必须是整数' })
    @Min(1, { message: '规则ID必须大于0' })
    ruleKeyId: number

    @ApiProperty({ description: '通道ID：SRM 通道主键；通道方向和类型必须与规则一致', example: 1001 })
    @Type(() => Number)
    @IsInt({ message: '通道ID必须是整数' })
    @Min(1, { message: '通道ID必须大于0' })
    channelKeyId: number

    @ApiProperty({ description: '优先级：1 为主通道，数字越大越靠后；当前优先级没有可用通道时降级到下一优先级', example: 1 })
    @Type(() => Number)
    @IsInt({ message: '优先级必须是整数' })
    @Min(1, { message: '优先级不能小于1' })
    @Max(9, { message: '优先级不能大于9' })
    priority: number

    @ApiProperty({ description: '分流权重：同一规则同一优先级内按权重比例分配', example: 100 })
    @Type(() => Number)
    @IsInt({ message: '分流权重必须是整数' })
    @Min(1, { message: '分流权重不能小于1' })
    @Max(10000, { message: '分流权重不能大于10000' })
    weight: number

    @ApiProperty({
        description: TbSrmRouteChannelStatusDefinition.comment,
        enum: TbSrmRouteChannelStatus,
        enumName: 'TbSrmRouteChannelStatus',
        example: TbSrmRouteChannelStatus.ENABLE
    })
    @IsEnum(TbSrmRouteChannelStatus, { message: '路由通道状态格式错误' })
    status: TbSrmRouteChannelStatus
}

@Index('uk_tb_srm_route_channel_rule_channel', ['ruleKeyId', 'channelKeyId'], { unique: true })
@Index('idx_tb_srm_route_channel_channel_key_id', ['channelKeyId'])
@Entity({ name: 'tb_srm_route_channel', comment: 'SRM 路由规则通道表' })
export class TbSrmRouteChannel extends DataBaseByAdapter {
    @Column({ name: TbSrmRouteChannelColumn.RULE_KEY_ID, type: 'int', nullable: false, comment: '规则ID：SRM 路由规则主键' })
    ruleKeyId: number

    @Column({ name: TbSrmRouteChannelColumn.CHANNEL_KEY_ID, type: 'int', nullable: false, comment: '通道ID：SRM 通道主键' })
    channelKeyId: number

    @Column({
        name: TbSrmRouteChannelColumn.PRIORITY,
        type: 'int',
        nullable: false,
        default: 1,
        comment: '优先级：1 为主通道，数字越大越靠后，当前优先级无可用通道时降级'
    })
    priority: number

    @Column({
        name: TbSrmRouteChannelColumn.WEIGHT,
        type: 'int',
        nullable: false,
        default: 100,
        comment: '分流权重：同一规则同一优先级内按权重比例分配'
    })
    weight: number

    @Column({
        name: TbSrmRouteChannelColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmRouteChannelStatus.ENABLE,
        comment: TbSrmRouteChannelStatusDefinition.comment
    })
    status: TbSrmRouteChannelStatus
}
