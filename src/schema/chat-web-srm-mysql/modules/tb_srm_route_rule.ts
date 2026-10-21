import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'
import { TbSrmChannelType, TbSrmChannelTypeDefinition } from './tb_srm_channel'

export enum TbSrmRouteRuleColumn {
    KEY_ID = 'key_id',
    ROUTE_KEY_ID = 'route_key_id',
    COUNTRY_KEY_ID = 'country_key_id',
    TYPE = 'type',
    MNC = 'mnc',
    PREFIX = 'prefix',
    STATUS = 'status',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmRouteRuleStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmRouteRuleStatusDefinition = defineEnumMetadata(TbSrmRouteRuleStatus, '路由规则状态', {
    [TbSrmRouteRuleStatus.DISABLE]: { label: '停用', description: '规则不参与匹配，继续匹配更粗粒度规则或通用路由', type: 'error' },
    [TbSrmRouteRuleStatus.ENABLE]: { label: '启用', description: '规则参与匹配', type: 'success' }
})

export class TbSrmRouteRuleDto extends DataBaseByDto {
    @ApiProperty({ description: '路由ID：SRM 路由主键', example: 1002001 })
    @Type(() => Number)
    @IsInt({ message: '路由ID必须是整数' })
    @Min(1, { message: '路由ID必须大于0' })
    routeKeyId: number

    @ApiProperty({ description: '方向：Skyline 国家/地区主键', example: 1007 })
    @Type(() => Number)
    @IsInt({ message: '方向必须是整数' })
    @Min(1, { message: '方向必须大于0' })
    countryKeyId: number

    @ApiProperty({
        description: TbSrmChannelTypeDefinition.comment,
        enum: TbSrmChannelType,
        enumName: 'TbSrmChannelType',
        example: TbSrmChannelType.SOTP
    })
    @IsEnum(TbSrmChannelType, { message: '短信类型格式错误' })
    type: TbSrmChannelType

    @ApiProperty({ description: '运营商 MNC：空字符串表示该方向全部运营商', required: false, example: '' })
    @IsOptional()
    @Matches(/^(\d{2,3})?$/, { message: '运营商MNC必须是2-3位数字或为空' })
    mnc: string

    @ApiProperty({ description: '号码段：含国际区号的号码前缀，空字符串表示不限号码段', required: false, example: '' })
    @IsOptional()
    @Matches(/^\d{0,15}$/, { message: '号码段只能是最多15位数字' })
    prefix: string

    @ApiProperty({
        description: TbSrmRouteRuleStatusDefinition.comment,
        enum: TbSrmRouteRuleStatus,
        enumName: 'TbSrmRouteRuleStatus',
        example: TbSrmRouteRuleStatus.ENABLE
    })
    @IsEnum(TbSrmRouteRuleStatus, { message: '路由规则状态格式错误' })
    status: TbSrmRouteRuleStatus

    @ApiProperty({ description: '备注', required: false, example: '香港验证码主线路' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(512, { message: '备注长度不能超过512位' })
    remark: string
}

/** 规则匹配时按 号码段 > 运营商 > 方向 从细到粗查找；mnc、prefix 用空字符串表示不限，保证唯一索引生效。 */
@Index('uk_tb_srm_route_rule_route_match', ['routeKeyId', 'countryKeyId', 'type', 'mnc', 'prefix'], { unique: true })
@Index('idx_tb_srm_route_rule_country_type', ['countryKeyId', 'type'])
@Index('idx_tb_srm_route_rule_status', ['status'])
@Entity({ name: 'tb_srm_route_rule', comment: 'SRM 路由规则表' })
export class TbSrmRouteRule extends DataBaseByAdapter {
    @Column({ name: TbSrmRouteRuleColumn.ROUTE_KEY_ID, type: 'int', nullable: false, comment: '路由ID：SRM 路由主键' })
    routeKeyId: number

    @Column({ name: TbSrmRouteRuleColumn.COUNTRY_KEY_ID, type: 'int', nullable: false, comment: '方向：Skyline 国家/地区主键' })
    countryKeyId: number

    @Column({ name: TbSrmRouteRuleColumn.TYPE, type: 'varchar', length: 32, nullable: false, comment: TbSrmChannelTypeDefinition.comment })
    type: TbSrmChannelType

    @Column({
        name: TbSrmRouteRuleColumn.MNC,
        type: 'varchar',
        length: 3,
        nullable: false,
        default: '',
        comment: '运营商 MNC：空字符串表示该方向全部运营商'
    })
    mnc: string

    @Column({
        name: TbSrmRouteRuleColumn.PREFIX,
        type: 'varchar',
        length: 15,
        nullable: false,
        default: '',
        comment: '号码段：含国际区号的号码前缀，空字符串表示不限号码段'
    })
    prefix: string

    @Column({
        name: TbSrmRouteRuleColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmRouteRuleStatus.ENABLE,
        comment: TbSrmRouteRuleStatusDefinition.comment
    })
    status: TbSrmRouteRuleStatus

    @Column({ name: TbSrmRouteRuleColumn.REMARK, type: 'varchar', length: 512, nullable: true, comment: '备注' })
    remark: string
}
