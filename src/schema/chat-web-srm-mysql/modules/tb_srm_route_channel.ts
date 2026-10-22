import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, Max, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbSrmRouteChannelColumn {
    KEY_ID = 'key_id',
    ROUTE_KEY_ID = 'route_key_id',
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
    [TbSrmRouteChannelStatus.DISABLE]: { label: '停用', description: '通道暂不参与该路由分流', type: 'error' },
    [TbSrmRouteChannelStatus.ENABLE]: { label: '启用', description: '通道参与该路由分流', type: 'success' }
})

export class TbSrmRouteChannelDto extends DataBaseByDto {
    @ApiProperty({ description: '路由ID：SRM 路由主键', example: 1002001 })
    @Type(() => Number)
    @IsInt({ message: '路由ID必须是整数' })
    @Min(1, { message: '路由ID必须大于0' })
    routeKeyId: number

    @ApiProperty({ description: '通道ID：SRM 通道主键；路由可以挂不同方向和类型的通道，选路时按短信的方向和类型筛选', example: 1001 })
    @Type(() => Number)
    @IsInt({ message: '通道ID必须是整数' })
    @Min(1, { message: '通道ID必须大于0' })
    channelKeyId: number

    @ApiProperty({
        description: '优先级：同一路由内同方向同类型的通道之间比较，1 为主通道，数字越大越靠后；当前优先级没有可用通道时降级到下一优先级',
        example: 1
    })
    @Type(() => Number)
    @IsInt({ message: '优先级必须是整数' })
    @Min(1, { message: '优先级不能小于1' })
    @Max(9, { message: '优先级不能大于9' })
    priority: number

    @ApiProperty({ description: '分流权重：同一路由内同方向、同类型、同优先级的通道之间按权重比例分配', example: 100 })
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

@Index('uk_tb_srm_route_channel_route_channel', ['routeKeyId', 'channelKeyId'], { unique: true })
@Index('idx_tb_srm_route_channel_channel_key_id', ['channelKeyId'])
@Entity({ name: 'tb_srm_route_channel', comment: 'SRM 路由通道表' })
export class TbSrmRouteChannel extends DataBaseByAdapter {
    @Column({ name: TbSrmRouteChannelColumn.ROUTE_KEY_ID, type: 'int', nullable: false, comment: '路由ID：SRM 路由主键' })
    routeKeyId: number

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
        comment: '分流权重：同一路由内同方向、同类型、同优先级的通道之间按权重比例分配'
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
