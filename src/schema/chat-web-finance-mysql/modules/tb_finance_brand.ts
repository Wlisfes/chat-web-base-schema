import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbFinanceBrandColumn {
    KEY_ID = 'key_id',
    NAME = 'name',
    DOCUMENT = 'document',
    STATUS = 'status',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 保留旧管理端使用的 enable/disable 值。 */
export enum TbFinanceBrandStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbFinanceBrandStatusDefinition = defineEnumMetadata(TbFinanceBrandStatus, '品牌状态', {
    [TbFinanceBrandStatus.DISABLE]: { label: '禁用', description: '品牌不可用于新客户' },
    [TbFinanceBrandStatus.ENABLE]: { label: '启用', description: '品牌可正常使用' }
})

export const {
    metadata: TbFinanceBrandStatusMetadata,
    options: TbFinanceBrandStatusOptions,
    count: TbFinanceBrandStatusCount,
    comment: TbFinanceBrandStatusComment
} = TbFinanceBrandStatusDefinition

export class TbFinanceBrandDto extends DataBaseByDto {
    @ApiProperty({ description: '品牌名称', example: 'LYNKS' })
    @IsString({ message: '品牌名称必须是字符串' })
    @IsNotEmpty({ message: '品牌名称必填' })
    @MaxLength(64, { message: '品牌名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '品牌描述', example: 'LYNKS 品牌', required: false })
    @IsOptional()
    @IsString({ message: '品牌描述必须是字符串' })
    @MaxLength(1024, { message: '品牌描述长度不能超过1024位' })
    document: string

    @ApiProperty({
        description: TbFinanceBrandStatusComment,
        enum: TbFinanceBrandStatus,
        enumName: 'TbFinanceBrandStatus',
        example: TbFinanceBrandStatus.ENABLE
    })
    @IsEnum(TbFinanceBrandStatus, { message: '品牌状态格式错误' })
    status: TbFinanceBrandStatus
}

@Index('uk_tb_finance_brand_name', ['name'], { unique: true })
@Index('idx_tb_finance_brand_status', ['status'])
@Entity({ name: 'tb_finance_brand', comment: '财务品牌表' })
export class TbFinanceBrand extends DataBaseByAdapter {
    @Column({ name: TbFinanceBrandColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '品牌名称' })
    name: string

    @Column({ name: TbFinanceBrandColumn.DOCUMENT, type: 'varchar', length: 1024, nullable: true, comment: '品牌描述' })
    document: string

    @Column({
        name: TbFinanceBrandColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbFinanceBrandStatusComment
    })
    status: TbFinanceBrandStatus
}
