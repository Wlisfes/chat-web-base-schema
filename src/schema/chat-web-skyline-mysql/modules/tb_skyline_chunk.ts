import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, WithJsonColumn, defineEnumMetadata } from '@/utils'

/** tb_skyline_chunk 的数据库字段名。 */
export enum TbSkylineChunkColumn {
    KEY_ID = 'key_id',
    PID = 'pid',
    MODULE = 'module',
    TYPE = 'type',
    NAME = 'name',
    VALUE = 'value',
    JSON = 'json',
    SORT = 'sort',
    STATUS = 'status',
    ALLOW_DELETE = 'allow_delete',
    ALLOW_UPDATE = 'allow_update',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 枚举项所属业务模块，用于管理端按模块展示字典数据。 */
export enum TbSkylineChunkModule {
    SYSTEM = 'system',
    SALES = 'sales',
    PURCHASE = 'purchase'
}

export const TbSkylineChunkModuleDefinition = defineEnumMetadata(TbSkylineChunkModule, '枚举所属模块', {
    [TbSkylineChunkModule.SYSTEM]: { label: '系统', description: '系统管理模块使用的枚举项' },
    [TbSkylineChunkModule.SALES]: { label: '销售', description: '销售管理模块使用的枚举项' },
    [TbSkylineChunkModule.PURCHASE]: { label: '采购', description: '采购管理模块使用的枚举项' }
})

export const {
    metadata: TbSkylineChunkModuleMetadata,
    options: TbSkylineChunkModuleOptions,
    count: TbSkylineChunkModuleCount,
    comment: TbSkylineChunkModuleComment
} = TbSkylineChunkModuleDefinition

/** 枚举项启用状态。 */
export enum TbSkylineChunkStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSkylineChunkStatusDefinition = defineEnumMetadata(TbSkylineChunkStatus, '枚举项状态', {
    [TbSkylineChunkStatus.DISABLE]: { label: '禁用', description: '枚举项不可用于业务选择' },
    [TbSkylineChunkStatus.ENABLE]: { label: '启用', description: '枚举项可正常用于业务选择' }
})

export const {
    metadata: TbSkylineChunkStatusMetadata,
    options: TbSkylineChunkStatusOptions,
    count: TbSkylineChunkStatusCount,
    comment: TbSkylineChunkStatusComment
} = TbSkylineChunkStatusDefinition

/** 枚举项完整字段 DTO；后端状态和其他下拉枚举统一通过此表持久化。 */
export class TbSkylineChunkDto extends DataBaseDto {
    @ApiProperty({ description: '父枚举项主键；根节点为空', example: 1, required: false, nullable: true })
    @IsOptional()
    @IsInt({ message: '父枚举项主键必须是整数' })
    @Min(1, { message: '父枚举项主键必须大于0' })
    pid: number

    @ApiProperty({
        description: TbSkylineChunkModuleComment,
        enum: TbSkylineChunkModule,
        enumName: 'TbSkylineChunkModule',
        example: TbSkylineChunkModule.SYSTEM
    })
    @IsEnum(TbSkylineChunkModule, { message: '枚举所属模块格式错误' })
    module: TbSkylineChunkModule

    @ApiProperty({ description: '枚举类型编码', example: 'CHUNK_DATETASK_STATUS' })
    @IsString({ message: '枚举类型编码必须是字符串' })
    @IsNotEmpty({ message: '枚举类型编码必填' })
    @MaxLength(128, { message: '枚举类型编码长度不能超过128位' })
    type: string

    @ApiProperty({ description: '枚举项显示名称', example: '运行中' })
    @IsString({ message: '枚举项显示名称必须是字符串' })
    @IsNotEmpty({ message: '枚举项显示名称必填' })
    @MaxLength(128, { message: '枚举项显示名称长度不能超过128位' })
    name: string

    @ApiProperty({ description: '枚举项业务值', example: 'running' })
    @IsString({ message: '枚举项业务值必须是字符串' })
    @IsNotEmpty({ message: '枚举项业务值必填' })
    @MaxLength(128, { message: '枚举项业务值长度不能超过128位' })
    value: string

    @ApiProperty({ description: '枚举项扩展配置', type: Object, required: false, example: { type: 'success' } })
    @IsOptional()
    @IsObject({ message: '枚举项扩展配置必须是对象' })
    json: Record<string, unknown>

    @ApiProperty({ description: '枚举项排序值，数值越小越靠前', example: 1 })
    @IsInt({ message: '枚举项排序值必须是整数' })
    @Min(0, { message: '枚举项排序值不能小于0' })
    sort: number

    @ApiProperty({
        description: TbSkylineChunkStatusComment,
        enum: TbSkylineChunkStatus,
        enumName: 'TbSkylineChunkStatus',
        example: TbSkylineChunkStatus.ENABLE
    })
    @IsEnum(TbSkylineChunkStatus, { message: '枚举项状态格式错误' })
    status: TbSkylineChunkStatus

    @ApiProperty({ description: '是否允许删除此枚举项', example: false, default: false })
    @IsBoolean({ message: '允许删除标识必须是布尔值' })
    allowDelete: boolean

    @ApiProperty({ description: '是否允许更新此枚举项', example: false, default: false })
    @IsBoolean({ message: '允许更新标识必须是布尔值' })
    allowUpdate: boolean
}

@Index('uk_tb_skyline_chunk_module_type_value', ['module', 'type', 'value'], { unique: true })
@Index('idx_tb_skyline_chunk_pid', ['pid'])
@Index('idx_tb_skyline_chunk_type_sort', ['type', 'sort'])
@Index('idx_tb_skyline_chunk_status', ['status'])
@Entity({ name: 'tb_skyline_chunk', comment: 'Skyline 后端枚举字典表' })
export class TbSkylineChunk extends DataBaseAdapter {
    @Column({ name: TbSkylineChunkColumn.PID, type: 'int', nullable: true, comment: '父枚举项主键；根节点为空' })
    pid: number

    @Column({
        name: TbSkylineChunkColumn.MODULE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSkylineChunkModule.SYSTEM,
        comment: TbSkylineChunkModuleComment
    })
    module: TbSkylineChunkModule

    @Column({ name: TbSkylineChunkColumn.TYPE, type: 'varchar', length: 128, nullable: false, comment: '枚举类型编码' })
    type: string

    @Column({ name: TbSkylineChunkColumn.NAME, type: 'varchar', length: 128, nullable: false, comment: '枚举项显示名称' })
    name: string

    @Column({ name: TbSkylineChunkColumn.VALUE, type: 'varchar', length: 128, nullable: false, comment: '枚举项业务值' })
    value: string

    @WithJsonColumn({ name: TbSkylineChunkColumn.JSON, nullable: true, comment: '枚举项扩展配置' })
    json: Record<string, unknown>

    @Column({ name: TbSkylineChunkColumn.SORT, type: 'int', nullable: false, default: 0, comment: '枚举项排序值' })
    sort: number

    @Column({
        name: TbSkylineChunkColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSkylineChunkStatus.ENABLE,
        comment: TbSkylineChunkStatusComment
    })
    status: TbSkylineChunkStatus

    @Column({ name: TbSkylineChunkColumn.ALLOW_DELETE, type: 'boolean', nullable: false, default: false, comment: '是否允许删除此枚举项' })
    allowDelete: boolean

    @Column({ name: TbSkylineChunkColumn.ALLOW_UPDATE, type: 'boolean', nullable: false, default: false, comment: '是否允许更新此枚举项' })
    allowUpdate: boolean
}
