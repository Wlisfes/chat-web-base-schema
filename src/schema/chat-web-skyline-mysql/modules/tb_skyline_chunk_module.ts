import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

/** tb_skyline_chunk_module 的数据库字段名。 */
export enum TbSkylineChunkModuleColumn {
    KEY_ID = 'key_id',
    MODULE = 'module',
    TYPE = 'type',
    NAME = 'name',
    KIND = 'kind',
    REMARK = 'remark',
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

/** 枚举类型编码：CHUNK_<模块>_<服务>_<业务表>_<业务字段>，主表 tb_skyline_chunk_module 与子表 tb_skyline_chunk 共用。 */
export enum TbSkylineChunkModuleType {
    CHUNK_SYSTEM_ACCOUNT_USER_POST = 'CHUNK_SYSTEM_ACCOUNT_USER_POST',
    CHUNK_SYSTEM_ACCOUNT_USER_LEVEL = 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL',
    CHUNK_CRM_CRM_USER_SOURCE = 'CHUNK_CRM_CRM_USER_SOURCE',
    CHUNK_SYSTEM_COMMON_CONTACT_TYPE = 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE'
}

export const TbSkylineChunkModuleTypeDefinition = defineEnumMetadata(TbSkylineChunkModuleType, '枚举类型编码', {
    [TbSkylineChunkModuleType.CHUNK_SYSTEM_ACCOUNT_USER_POST]: {
        label: '用户岗位',
        description: 'Account 账号岗位，仅一级枚举项，适用于普通下拉选择',
        type: 'blue'
    },
    [TbSkylineChunkModuleType.CHUNK_SYSTEM_ACCOUNT_USER_LEVEL]: {
        label: '用户职级',
        description: 'Account 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项',
        type: 'purple'
    },
    [TbSkylineChunkModuleType.CHUNK_CRM_CRM_USER_SOURCE]: {
        label: '客户注册来源',
        description: 'CRM 客户注册来源，仅一级枚举项',
        type: 'orange'
    },
    [TbSkylineChunkModuleType.CHUNK_SYSTEM_COMMON_CONTACT_TYPE]: {
        label: '联系方式',
        description: '系统通用联系方式类型，仅一级枚举项',
        type: 'cyan'
    }
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

    @ApiProperty({
        description: TbSkylineChunkModuleTypeDefinition.comment,
        enum: TbSkylineChunkModuleType,
        enumName: 'TbSkylineChunkModuleType',
        example: TbSkylineChunkModuleType.CHUNK_SYSTEM_ACCOUNT_USER_POST
    })
    @IsEnum(TbSkylineChunkModuleType, { message: '枚举类型编码格式错误' })
    type: TbSkylineChunkModuleType

    @ApiProperty({ description: '枚举分类名称', example: '岗位' })
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

    @ApiProperty({ description: '枚举分类备注', example: '账号岗位', required: false })
    @IsOptional()
    @IsString({ message: '枚举分类备注必须是字符串' })
    @MaxLength(256, { message: '枚举分类备注长度不能超过256位' })
    remark: string
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
        comment: TbSkylineChunkModuleTypeDefinition.comment
    })
    type: TbSkylineChunkModuleType

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
}
