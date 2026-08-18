import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

export enum TbFinanceCurrencyColumn {
    KEY_ID = 'key_id',
    CURRENCY = 'currency',
    NAME = 'name',
    SYMBOL = 'symbol',
    STATUS = 'status',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbFinanceCurrencyStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbFinanceCurrencyStatusDefinition = defineEnumMetadata(TbFinanceCurrencyStatus, '币种状态', {
    [TbFinanceCurrencyStatus.DISABLE]: { label: '禁用', description: '币种不可用于新业务' },
    [TbFinanceCurrencyStatus.ENABLE]: { label: '启用', description: '币种可正常使用' }
})

export const {
    metadata: TbFinanceCurrencyStatusMetadata,
    options: TbFinanceCurrencyStatusOptions,
    count: TbFinanceCurrencyStatusCount,
    comment: TbFinanceCurrencyStatusComment
} = TbFinanceCurrencyStatusDefinition

export class TbFinanceCurrencyDto extends DataBaseDto {
    @ApiProperty({ description: '币种编码', example: 'USD' })
    @IsString({ message: '币种编码必须是字符串' })
    @IsNotEmpty({ message: '币种编码必填' })
    @MaxLength(16, { message: '币种编码长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '币种名称', example: '美元' })
    @IsString({ message: '币种名称必须是字符串' })
    @IsNotEmpty({ message: '币种名称必填' })
    @MaxLength(64, { message: '币种名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '币种符号', example: '$' })
    @IsString({ message: '币种符号必须是字符串' })
    @IsNotEmpty({ message: '币种符号必填' })
    @MaxLength(8, { message: '币种符号长度不能超过8位' })
    symbol: string

    @ApiProperty({
        description: TbFinanceCurrencyStatusComment,
        enum: TbFinanceCurrencyStatus,
        enumName: 'TbFinanceCurrencyStatus',
        example: TbFinanceCurrencyStatus.ENABLE
    })
    @IsEnum(TbFinanceCurrencyStatus, { message: '币种状态格式错误' })
    status: TbFinanceCurrencyStatus
}

@Index('uk_tb_finance_currency_currency', ['currency'], { unique: true })
@Index('idx_tb_finance_currency_status', ['status'])
@Entity({ name: 'tb_finance_currency', comment: '财务币种表' })
export class TbFinanceCurrency extends DataBaseAdapter {
    @Column({ name: TbFinanceCurrencyColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '币种编码' })
    currency: string

    @Column({ name: TbFinanceCurrencyColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '币种名称' })
    name: string

    @Column({ name: TbFinanceCurrencyColumn.SYMBOL, type: 'varchar', length: 8, nullable: false, comment: '币种符号' })
    symbol: string

    @Column({
        name: TbFinanceCurrencyColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbFinanceCurrencyStatusComment
    })
    status: TbFinanceCurrencyStatus
}
