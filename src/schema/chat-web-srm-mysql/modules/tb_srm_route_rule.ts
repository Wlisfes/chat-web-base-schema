import { Entity, Index, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    ArrayMaxSize,
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateNested
} from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, WithJsonColumn, defineEnumMetadata } from '@/utils'

export enum TbSrmRouteRuleColumn {
    KEY_ID = 'key_id',
    ROUTE_KEY_ID = 'route_key_id',
    SORT = 'sort',
    CONDITIONS = 'conditions',
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

export const TbSrmRouteRuleStatusDefinition = defineEnumMetadata(TbSrmRouteRuleStatus, '规则组状态', {
    [TbSrmRouteRuleStatus.DISABLE]: { label: '停用', description: '规则组不参与匹配', type: 'error' },
    [TbSrmRouteRuleStatus.ENABLE]: { label: '启用', description: '规则组参与匹配', type: 'success' }
})

/** 条件字段：短信的哪个属性参与判断。 */
export enum TbSrmRouteRuleField {
    COUNTRY = 'country',
    TYPE = 'type',
    PREFIX = 'prefix'
}

export const TbSrmRouteRuleFieldDefinition = defineEnumMetadata(TbSrmRouteRuleField, '条件字段', {
    [TbSrmRouteRuleField.COUNTRY]: { label: '方向', description: '取值为 Skyline 国家/地区主键', type: 'info' },
    [TbSrmRouteRuleField.TYPE]: { label: '短信类型', description: '取值与短信应用类型 TbSmsAppType 一致：MRKT、NTFY、SOTP', type: 'info' },
    [TbSrmRouteRuleField.PREFIX]: { label: '号码段', description: '取值为含国际区号、不带 + 号的号码前缀', type: 'info' }
})

/** 条件操作符：in / not_in 用于方向和短信类型，prefix / not_prefix 用于号码段。 */
export enum TbSrmRouteRuleOperator {
    IN = 'in',
    NOT_IN = 'not_in',
    PREFIX = 'prefix',
    NOT_PREFIX = 'not_prefix'
}

export const TbSrmRouteRuleOperatorDefinition = defineEnumMetadata(TbSrmRouteRuleOperator, '条件操作符', {
    [TbSrmRouteRuleOperator.IN]: { label: '属于', description: '取值中任意一个相等即满足', type: 'info' },
    [TbSrmRouteRuleOperator.NOT_IN]: { label: '不属于', description: '与取值全部不相等才满足', type: 'warning' },
    [TbSrmRouteRuleOperator.PREFIX]: { label: '以…开头', description: '号码以任意一个取值开头即满足', type: 'info' },
    [TbSrmRouteRuleOperator.NOT_PREFIX]: { label: '不以…开头', description: '号码不以任何一个取值开头才满足', type: 'warning' }
})

/** 规则组内的一个条件；同一规则组内所有条件全部满足才算命中。 */
export class TbSrmRouteRuleCondition {
    @ApiProperty({
        description: TbSrmRouteRuleFieldDefinition.comment,
        enum: TbSrmRouteRuleField,
        enumName: 'TbSrmRouteRuleField',
        example: 'country'
    })
    @IsEnum(TbSrmRouteRuleField, { message: '条件字段格式错误' })
    field: TbSrmRouteRuleField

    @ApiProperty({
        description: TbSrmRouteRuleOperatorDefinition.comment,
        enum: TbSrmRouteRuleOperator,
        enumName: 'TbSrmRouteRuleOperator',
        example: 'in'
    })
    @IsEnum(TbSrmRouteRuleOperator, { message: '条件操作符格式错误' })
    operator: TbSrmRouteRuleOperator

    @ApiProperty({
        description: '条件取值：方向为国家/地区主键，短信类型为类型编码，号码段为数字前缀；多个值之间是“任意一个”',
        type: [String],
        example: ['1007']
    })
    @IsArray({ message: '条件取值必须是数组' })
    @ArrayNotEmpty({ message: '条件取值不能为空' })
    @ArrayMaxSize(200, { message: '条件取值单个条件最多200个' })
    @IsString({ each: true, message: '条件取值必须是字符串' })
    @MaxLength(20, { each: true, message: '条件取值长度不能超过20位' })
    value: string[]
}

export class TbSrmRouteRuleDto extends DataBaseByDto {
    @ApiProperty({ description: '路由ID：SRM 路由主键', example: 1002001 })
    @Type(() => Number)
    @IsInt({ message: '路由ID必须是整数' })
    @Min(1, { message: '路由ID必须大于0' })
    routeKeyId: number

    @ApiProperty({ description: '排序：规则组的展示和匹配顺序，数字越小越靠前；规则组之间是“或”，排序不影响是否命中', example: 0 })
    @Type(() => Number)
    @IsInt({ message: '排序必须是整数' })
    @Min(0, { message: '排序不能小于0' })
    @Max(9999, { message: '排序不能大于9999' })
    sort: number

    @ApiProperty({
        description: '组内条件：全部满足才算命中（且）；同一路由的多个规则组之间满足任意一组即可（或）',
        type: [TbSrmRouteRuleCondition]
    })
    @IsArray({ message: '组内条件必须是数组' })
    @ArrayNotEmpty({ message: '组内条件不能为空' })
    @ArrayMaxSize(20, { message: '组内条件最多20个' })
    @ValidateNested({ each: true })
    @Type(() => TbSrmRouteRuleCondition)
    conditions: TbSrmRouteRuleCondition[]

    @ApiProperty({
        description: TbSrmRouteRuleStatusDefinition.comment,
        enum: TbSrmRouteRuleStatus,
        enumName: 'TbSrmRouteRuleStatus',
        example: TbSrmRouteRuleStatus.ENABLE
    })
    @IsEnum(TbSrmRouteRuleStatus, { message: '规则组状态格式错误' })
    status: TbSrmRouteRuleStatus

    @ApiProperty({ description: '备注', required: false, example: '中国营销短信走这条路由' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(512, { message: '备注长度不能超过512位' })
    remark: string
}

/** 路由规则组：同一路由的多个规则组之间是“或”，组内条件之间是“且”；路由没有启用的规则组时不接收任何短信。 */
@Index('idx_tb_srm_route_rule_route_sort', ['routeKeyId', 'sort'])
@Entity({ name: 'tb_srm_route_rule', comment: 'SRM 路由规则组表' })
export class TbSrmRouteRule extends DataBaseByAdapter {
    @Column({ name: TbSrmRouteRuleColumn.ROUTE_KEY_ID, type: 'int', nullable: false, comment: '路由ID：SRM 路由主键' })
    routeKeyId: number

    @Column({
        name: TbSrmRouteRuleColumn.SORT,
        type: 'int',
        nullable: false,
        default: 0,
        comment: '排序：规则组的展示和匹配顺序，数字越小越靠前；规则组之间是“或”，排序不影响是否命中'
    })
    sort: number

    @WithJsonColumn<TbSrmRouteRuleCondition[]>({
        name: TbSrmRouteRuleColumn.CONDITIONS,
        nullable: false,
        comment: '组内条件 JSON 数组：[{ field, operator, value: string[] }]，全部满足才算命中'
    })
    conditions: TbSrmRouteRuleCondition[]

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
