import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'
import { TbSrmChannelType, TbSrmChannelTypeDefinition } from './tb_srm_channel'

export enum TbSrmRouteColumn {
    KEY_ID = 'key_id',
    COUNTRY_KEY_ID = 'country_key_id',
    TYPE = 'type',
    USER_KEY_ID = 'user_key_id',
    STATUS = 'status',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 默认路由的客户主键：未配置专属路由的客户都走默认路由。 */
export const TB_SRM_ROUTE_DEFAULT_USER_KEY_ID = 0

export enum TbSrmRouteStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmRouteStatusDefinition = defineEnumMetadata(TbSrmRouteStatus, '路由状态', {
    [TbSrmRouteStatus.DISABLE]: { label: '停用', description: '路由不参与选通道，专属路由停用后客户回落到默认路由', type: 'error' },
    [TbSrmRouteStatus.ENABLE]: { label: '启用', description: '路由参与选通道', type: 'success' }
})

export class TbSrmRouteDto extends DataBaseByDto {
    @ApiProperty({ description: '方向：Skyline 国家/地区主键，创建后不可修改', example: 1007 })
    @Type(() => Number)
    @IsInt({ message: '方向必须是整数' })
    @Min(1, { message: '方向必须大于0' })
    countryKeyId: number

    @ApiProperty({
        description: TbSrmChannelTypeDefinition.comment,
        enum: TbSrmChannelType,
        enumName: 'TbSrmChannelType',
        example: TbSrmChannelType.MRKT
    })
    @IsEnum(TbSrmChannelType, { message: '短信类型格式错误' })
    type: TbSrmChannelType

    @ApiProperty({ description: 'CRM 客户主键：0 表示默认路由，大于0 表示该客户的专属路由；创建后不可修改', example: 0 })
    @Type(() => Number)
    @IsInt({ message: '客户必须是整数' })
    @Min(0, { message: '客户不能小于0' })
    userKeyId: number

    @ApiProperty({
        description: TbSrmRouteStatusDefinition.comment,
        enum: TbSrmRouteStatus,
        enumName: 'TbSrmRouteStatus',
        example: TbSrmRouteStatus.ENABLE
    })
    @IsEnum(TbSrmRouteStatus, { message: '路由状态格式错误' })
    status: TbSrmRouteStatus

    @ApiProperty({ description: '备注', required: false, example: '大客户专属线路' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(512, { message: '备注长度不能超过512位' })
    remark: string
}

@Index('uk_tb_srm_route_country_type_user', ['countryKeyId', 'type', 'userKeyId'], { unique: true })
@Index('idx_tb_srm_route_user_key_id', ['userKeyId'])
@Index('idx_tb_srm_route_status', ['status'])
@Entity({ name: 'tb_srm_route', comment: 'SRM 短信路由策略表' })
export class TbSrmRoute extends DataBaseByAdapter {
    @Column({ name: TbSrmRouteColumn.COUNTRY_KEY_ID, type: 'int', nullable: false, comment: '方向：Skyline 国家/地区主键' })
    countryKeyId: number

    @Column({ name: TbSrmRouteColumn.TYPE, type: 'varchar', length: 32, nullable: false, comment: TbSrmChannelTypeDefinition.comment })
    type: TbSrmChannelType

    @Column({
        name: TbSrmRouteColumn.USER_KEY_ID,
        type: 'int',
        nullable: false,
        default: TB_SRM_ROUTE_DEFAULT_USER_KEY_ID,
        comment: 'CRM 客户主键：0 表示默认路由，大于0 表示该客户的专属路由'
    })
    userKeyId: number

    @Column({
        name: TbSrmRouteColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmRouteStatus.ENABLE,
        comment: TbSrmRouteStatusDefinition.comment
    })
    status: TbSrmRouteStatus

    @Column({ name: TbSrmRouteColumn.REMARK, type: 'varchar', length: 512, nullable: true, comment: '备注' })
    remark: string
}
