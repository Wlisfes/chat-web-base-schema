import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbSrmRouteColumn {
    KEY_ID = 'key_id',
    NAME = 'name',
    ALIAS = 'alias',
    IS_DEFAULT = 'is_default',
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

export const TbSrmRouteStatusDefinition = defineEnumMetadata(TbSrmRouteStatus, '路由方案状态', {
    [TbSrmRouteStatus.DISABLE]: { label: '停用', description: '方案不参与选路，绑定该方案的短信应用回落到默认方案', type: 'error' },
    [TbSrmRouteStatus.ENABLE]: { label: '启用', description: '方案参与选路', type: 'success' }
})

export class TbSrmRouteDto extends DataBaseByDto {
    @ApiProperty({ description: '方案名称', example: '标准线路' })
    @IsString({ message: '方案名称必须是字符串' })
    @IsNotEmpty({ message: '方案名称必填' })
    @MaxLength(64, { message: '方案名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '方案别名：自定义的方案简称，全表唯一', example: 'RT-STANDARD', required: false })
    @IsOptional()
    @IsString({ message: '方案别名必须是字符串' })
    @MaxLength(64, { message: '方案别名长度不能超过64位' })
    alias: string

    @ApiProperty({
        description: '是否默认方案：未绑定方案或绑定方案无匹配规则的短信应用走默认方案；全表只能有一个默认方案',
        example: false
    })
    @IsBoolean({ message: '默认方案标记必须是布尔值' })
    isDefault: boolean

    @ApiProperty({
        description: TbSrmRouteStatusDefinition.comment,
        enum: TbSrmRouteStatus,
        enumName: 'TbSrmRouteStatus',
        example: TbSrmRouteStatus.ENABLE
    })
    @IsEnum(TbSrmRouteStatus, { message: '路由方案状态格式错误' })
    status: TbSrmRouteStatus

    @ApiProperty({ description: '备注', required: false, example: '普通客户通用线路' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(512, { message: '备注长度不能超过512位' })
    remark: string
}

@Index('uk_tb_srm_route_alias', ['alias'], { unique: true })
@Index('idx_tb_srm_route_is_default', ['isDefault'])
@Index('idx_tb_srm_route_status', ['status'])
@Entity({ name: 'tb_srm_route', comment: 'SRM 短信路由方案表' })
export class TbSrmRoute extends DataBaseByAdapter {
    @Column({ name: TbSrmRouteColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '方案名称' })
    name: string

    @Column({
        name: TbSrmRouteColumn.ALIAS,
        type: 'varchar',
        length: 64,
        nullable: true,
        comment: '方案别名：自定义的方案简称，全表唯一'
    })
    alias: string

    @Column({
        name: TbSrmRouteColumn.IS_DEFAULT,
        type: 'boolean',
        nullable: false,
        default: false,
        comment: '是否默认方案：未绑定方案或绑定方案无匹配规则的短信应用走默认方案'
    })
    isDefault: boolean

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
