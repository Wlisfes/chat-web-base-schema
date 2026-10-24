import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbSrmRouteColumn {
    KEY_ID = 'key_id',
    NAME = 'name',
    ALIAS = 'alias',
    TYPE = 'type',
    PRIORITY = 'priority',
    STATUS = 'status',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmRouteStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmRouteStatusDefinition = defineEnumMetadata(TbSrmRouteStatus, '路由状态', {
    [TbSrmRouteStatus.DISABLE]: { label: '停用', description: '路由不参与选路，绑定该路由的短信应用回落到同类型路由', type: 'error' },
    [TbSrmRouteStatus.ENABLE]: { label: '启用', description: '路由参与选路', type: 'success' }
})

/** 路由类型：取值与短信应用类型一致，但在路由侧单独定义；创建后不可修改。 */
export enum TbSrmRouteType {
    MRKT = 'MRKT',
    NTFY = 'NTFY',
    SOTP = 'SOTP'
}

export const TbSrmRouteTypeDefinition = defineEnumMetadata(TbSrmRouteType, '路由类型', {
    [TbSrmRouteType.MRKT]: { label: '营销路由', description: '用于营销推广内容', type: 'orange' },
    [TbSrmRouteType.NTFY]: { label: '通知路由', description: '用于业务通知内容', type: 'info' },
    [TbSrmRouteType.SOTP]: { label: 'OTP路由', description: '用于一次性验证码', type: 'success' }
})

export class TbSrmRouteDto extends DataBaseByDto {
    @ApiProperty({ description: '路由名称', example: '标准线路' })
    @IsString({ message: '路由名称必须是字符串' })
    @IsNotEmpty({ message: '路由名称必填' })
    @MaxLength(64, { message: '路由名称长度不能超过64位' })
    name: string

    @ApiProperty({
        description: '路由别名：创建后按 LSK + 主键 + 路由类型自动生成，例如 LSK1002001-MRKT，全表唯一，创建后不可修改',
        example: 'LSK1002001-MRKT',
        required: false
    })
    @IsOptional()
    @IsString({ message: '路由别名必须是字符串' })
    @MaxLength(64, { message: '路由别名长度不能超过64位' })
    alias: string

    @ApiProperty({
        description: TbSrmRouteTypeDefinition.comment,
        enum: TbSrmRouteType,
        enumName: 'TbSrmRouteType',
        example: TbSrmRouteType.SOTP
    })
    @IsEnum(TbSrmRouteType, { message: '路由类型格式错误' })
    type: TbSrmRouteType

    @ApiProperty({ description: '优先级：同类型路由按优先级从小到大依次尝试，1 最优先，最大 100', example: 1 })
    @Type(() => Number)
    @IsInt({ message: '优先级必须是整数' })
    @Min(1, { message: '优先级不能小于1' })
    @Max(100, { message: '优先级不能大于100' })
    priority: number

    @ApiProperty({
        description: TbSrmRouteStatusDefinition.comment,
        enum: TbSrmRouteStatus,
        enumName: 'TbSrmRouteStatus',
        example: TbSrmRouteStatus.ENABLE
    })
    @IsEnum(TbSrmRouteStatus, { message: '路由状态格式错误' })
    status: TbSrmRouteStatus

    @ApiProperty({ description: '备注', required: false, example: '普通客户通用线路' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(512, { message: '备注长度不能超过512位' })
    remark: string
}

@Index('uk_tb_srm_route_alias', ['alias'], { unique: true })
@Index('idx_tb_srm_route_type_priority', ['type', 'priority'])
@Index('idx_tb_srm_route_status', ['status'])
@Entity({ name: 'tb_srm_route', comment: 'SRM 短信路由表' })
export class TbSrmRoute extends DataBaseByAdapter {
    @Column({ name: TbSrmRouteColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '路由名称' })
    name: string

    @Column({
        name: TbSrmRouteColumn.ALIAS,
        type: 'varchar',
        length: 64,
        nullable: true,
        comment: '路由别名：创建后按 LSK + 主键 + 路由类型自动生成，例如 LSK1002001-MRKT，全表唯一，创建后不可修改'
    })
    alias: string

    @Column({
        name: TbSrmRouteColumn.TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSrmRouteTypeDefinition.comment
    })
    type: TbSrmRouteType

    @Column({
        name: TbSrmRouteColumn.PRIORITY,
        type: 'int',
        nullable: false,
        default: 10,
        comment: '优先级：同类型路由按优先级从小到大依次尝试，1 最优先，最大 100'
    })
    priority: number

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
