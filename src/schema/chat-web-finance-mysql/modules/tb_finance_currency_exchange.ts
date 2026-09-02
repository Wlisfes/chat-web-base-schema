import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

export enum TbFinanceCurrencyExchangeColumn {
    KEY_ID = 'key_id',
    CURRENCY = 'currency',
    RATE = 'rate',
    RATE_DATE = 'date',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export class TbFinanceCurrencyExchangeDto extends DataBaseDto {
    @ApiProperty({ description: '币种编码', example: 'CNY' })
    @IsString({ message: '币种编码必须是字符串' })
    @IsNotEmpty({ message: '币种编码必填' })
    @MaxLength(16, { message: '币种编码长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '基于 USD 的汇率', example: 7.2534 })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 6 }, { message: '汇率格式错误' })
    @Min(0, { message: '汇率不能小于0' })
    rate: number

    @ApiProperty({ description: '汇率日期', example: '2026-08-18' })
    @IsDateString({}, { message: '汇率日期格式错误' })
    rateDate: string
}

@Index('uk_tb_finance_currency_exchange_currency_date', ['currency', 'rateDate'], { unique: true })
@Index('idx_tb_finance_currency_exchange_rate_date', ['rateDate'])
@Entity({ name: 'tb_finance_currency_exchange', comment: '财务币种汇率表' })
export class TbFinanceCurrencyExchange extends DataBaseAdapter {
    @Column({ name: TbFinanceCurrencyExchangeColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '币种编码' })
    currency: string

    @Column({
        name: TbFinanceCurrencyExchangeColumn.RATE,
        type: 'decimal',
        precision: 16,
        scale: 6,
        nullable: false,
        comment: '基于 USD 的汇率'
    })
    rate: number

    // 数据库列名统一为 date，属性名保留 rateDate 以兼容既有服务间接口。
    @Column({ name: TbFinanceCurrencyExchangeColumn.RATE_DATE, type: 'date', nullable: false, comment: '汇率日期' })
    rateDate: string
}
