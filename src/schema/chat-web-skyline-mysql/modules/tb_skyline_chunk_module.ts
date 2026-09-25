import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

/** tb_skyline_chunk_module 的数据库字段名。 */
export enum TbSkylineChunkModuleColumn {
    KEY_ID = 'key_id',
    MODULE = 'module',
    TYPE = 'type',
    NAME = 'name',
    KIND = 'kind',
    REMARK = 'remark',
    ALLOW_DELETE = 'allow_delete',
    ALLOW_UPDATE = 'allow_update',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 枚举项所属业务模块，用于管理端按模块展示字典分类。 */
export enum TbSkylineChunkModule {
    CHUNK_SYSTEM = 'CHUNK_SYSTEM',
    CHUNK_CRM = 'CHUNK_CRM',
    CHUNK_SRM = 'CHUNK_SRM'
}

export const TbSkylineChunkModuleDefinition = defineEnumMetadata(TbSkylineChunkModule, '枚举所属模块', {
    [TbSkylineChunkModule.CHUNK_SYSTEM]: { label: '系统', description: '系统管理模块使用的枚举项', type: 'geekblue' },
    [TbSkylineChunkModule.CHUNK_CRM]: { label: 'CRM', description: 'CRM 客户关系管理模块使用的枚举项', type: 'blue' },
    [TbSkylineChunkModule.CHUNK_SRM]: { label: 'SRM', description: 'SRM 供应商关系管理模块使用的枚举项', type: 'cyan' }
})

/** 枚举分类字段类型，决定子表项是平铺下拉还是树形结构。 */
export enum TbSkylineChunkModuleKind {
    SELECT = 'select',
    TREE = 'tree'
}

export const TbSkylineChunkModuleKindDefinition = defineEnumMetadata(TbSkylineChunkModuleKind, '枚举字段类型', {
    [TbSkylineChunkModuleKind.SELECT]: { label: '下拉选项', description: '仅一级枚举项，适用于普通下拉选择', type: 'blue' },
    [TbSkylineChunkModuleKind.TREE]: { label: '树形选项', description: '支持多级枚举项，适用于树形选择', type: 'cyan' }
})

/** 枚举分类完整字段 DTO；外层页面只展示分类，明细 CRUD 落在子表 tb_skyline_chunk。 */
export class TbSkylineChunkModuleDto extends DataBaseByDto {
    @ApiProperty({
        description: TbSkylineChunkModuleDefinition.comment,
        enum: TbSkylineChunkModule,
        enumName: 'TbSkylineChunkModule',
        example: TbSkylineChunkModule.CHUNK_SYSTEM
    })
    @IsEnum(TbSkylineChunkModule, { message: '枚举所属模块格式错误' })
    module: TbSkylineChunkModule

    @ApiProperty({ description: '枚举类型编码，对应子表 tb_skyline_chunk.type', example: 'CHUNK_ACCOUNT_POSITION' })
    @IsString({ message: '枚举类型编码必须是字符串' })
    @IsNotEmpty({ message: '枚举类型编码必填' })
    @MaxLength(128, { message: '枚举类型编码长度不能超过128位' })
    type: string

    @ApiProperty({ description: '枚举分类名称', example: '职位' })
    @IsString({ message: '枚举分类名称必须是字符串' })
    @IsNotEmpty({ message: '枚举分类名称必填' })
    @MaxLength(128, { message: '枚举分类名称长度不能超过128位' })
    name: string

    @ApiProperty({
        description: TbSkylineChunkModuleKindDefinition.comment,
        enum: TbSkylineChunkModuleKind,
        enumName: 'TbSkylineChunkModuleKind',
        example: TbSkylineChunkModuleKind.SELECT
    })
    @IsEnum(TbSkylineChunkModuleKind, { message: '枚举字段类型格式错误' })
    kind: TbSkylineChunkModuleKind

    @ApiProperty({ description: '枚举分类备注', example: '账号职位', required: false })
    @IsOptional()
    @IsString({ message: '枚举分类备注必须是字符串' })
    @MaxLength(256, { message: '枚举分类备注长度不能超过256位' })
    remark: string

    @ApiProperty({ description: '是否允许删除此枚举分类', example: false, default: false })
    @IsBoolean({ message: '允许删除标识必须是布尔值' })
    allowDelete: boolean

    @ApiProperty({ description: '是否允许更新此枚举分类', example: true, default: false })
    @IsBoolean({ message: '允许更新标识必须是布尔值' })
    allowUpdate: boolean
}

@Index('uk_tb_skyline_chunk_module_module_type', ['module', 'type'], { unique: true })
@Index('idx_tb_skyline_chunk_module_module', ['module'])
@Entity({ name: 'tb_skyline_chunk_module', comment: 'Skyline 枚举分类表' })
export class TbSkylineChunkModuleEntity extends DataBaseByAdapter {
    @Column({
        name: TbSkylineChunkModuleColumn.MODULE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSkylineChunkModule.CHUNK_SYSTEM,
        comment: TbSkylineChunkModuleDefinition.comment
    })
    module: TbSkylineChunkModule

    @Column({
        name: TbSkylineChunkModuleColumn.TYPE,
        type: 'varchar',
        length: 128,
        nullable: false,
        comment: '枚举类型编码，对应子表 tb_skyline_chunk.type'
    })
    type: string

    @Column({ name: TbSkylineChunkModuleColumn.NAME, type: 'varchar', length: 128, nullable: false, comment: '枚举分类名称' })
    name: string

    @Column({
        name: TbSkylineChunkModuleColumn.KIND,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSkylineChunkModuleKind.SELECT,
        comment: TbSkylineChunkModuleKindDefinition.comment
    })
    kind: TbSkylineChunkModuleKind

    @Column({ name: TbSkylineChunkModuleColumn.REMARK, type: 'varchar', length: 256, nullable: true, comment: '枚举分类备注' })
    remark: string

    @Column({
        name: TbSkylineChunkModuleColumn.ALLOW_DELETE,
        type: 'boolean',
        nullable: false,
        default: false,
        comment: '是否允许删除此枚举分类'
    })
    allowDelete: boolean

    @Column({
        name: TbSkylineChunkModuleColumn.ALLOW_UPDATE,
        type: 'boolean',
        nullable: false,
        default: false,
        comment: '是否允许更新此枚举分类'
    })
    allowUpdate: boolean
}
