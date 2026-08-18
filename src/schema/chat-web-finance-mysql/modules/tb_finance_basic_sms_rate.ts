import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto } from '@/utils'

export enum TbFinanceBasicSmsRateColumn {
    KEY_ID = 'key_id',
    CODE = 'code',
    MCC = 'mcc',
    UP_USD = 'up_usd',
    DOWN_USD = 'down_usd',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export class TbFinanceBasicSmsRateDto extends DataBaseByDto {
    @ApiProperty({ description: '国家/地区国际区号', example: '86' })
    @IsString({ message: '国家/地区编码必须是字符串' })
    @IsNotEmpty({ message: '国家/地区编码必填' })
    @MaxLength(10, { message: '国家/地区编码长度不能超过10位' })
    code: string

    @ApiProperty({ description: '移动国家代码', example: '460' })
    @IsString({ message: '移动国家代码必须是字符串' })
    @IsNotEmpty({ message: '移动国家代码必填' })
    @MaxLength(4, { message: '移动国家代码长度不能超过4位' })
    mcc: string

    @ApiProperty({ description: '上行短信价格（放大百万倍存储）', example: 1008600 })
    @IsInt({ message: '上行短信价格必须是整数' })
    @Min(0, { message: '上行短信价格不能小于0' })
    upUsd: number

    @ApiProperty({ description: '下行短信价格（放大百万倍存储）', example: 1008600 })
    @IsInt({ message: '下行短信价格必须是整数' })
    @Min(0, { message: '下行短信价格不能小于0' })
    downUsd: number

    @ApiProperty({ description: '备注', example: '运营商基础价格', required: false })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('uk_tb_finance_basic_sms_rate_code_mcc', ['code', 'mcc'], { unique: true })
@Index('idx_tb_finance_basic_sms_rate_code', ['code'])
@Entity({ name: 'tb_finance_basic_sms_rate', comment: '财务短信基础价格表' })
export class TbFinanceBasicSmsRate extends DataBaseByAdapter {
    @Column({ name: TbFinanceBasicSmsRateColumn.CODE, type: 'varchar', length: 10, nullable: false, comment: '国家/地区国际区号' })
    code: string

    @Column({ name: TbFinanceBasicSmsRateColumn.MCC, type: 'varchar', length: 4, nullable: false, comment: '移动国家代码' })
    mcc: string

    @Column({ name: TbFinanceBasicSmsRateColumn.UP_USD, type: 'bigint', nullable: false, comment: '上行短信价格（放大百万倍存储）' })
    upUsd: number

    @Column({ name: TbFinanceBasicSmsRateColumn.DOWN_USD, type: 'bigint', nullable: false, comment: '下行短信价格（放大百万倍存储）' })
    downUsd: number

    @Column({ name: TbFinanceBasicSmsRateColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
