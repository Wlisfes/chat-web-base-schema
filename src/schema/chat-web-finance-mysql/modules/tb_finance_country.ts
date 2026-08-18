import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

export enum TbFinanceCountryColumn {
    KEY_ID = 'key_id',
    CODE = 'code',
    MCC = 'mcc',
    CN_NAME = 'cn_name',
    EN_NAME = 'en_name',
    STATUS = 'status',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbFinanceCountryStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbFinanceCountryStatusDefinition = defineEnumMetadata(TbFinanceCountryStatus, '国家/地区状态', {
    [TbFinanceCountryStatus.DISABLE]: { label: '禁用', description: '国家/地区不可用于新业务' },
    [TbFinanceCountryStatus.ENABLE]: { label: '启用', description: '国家/地区可正常使用' }
})

export const {
    metadata: TbFinanceCountryStatusMetadata,
    options: TbFinanceCountryStatusOptions,
    count: TbFinanceCountryStatusCount,
    comment: TbFinanceCountryStatusComment
} = TbFinanceCountryStatusDefinition

export class TbFinanceCountryDto extends DataBaseDto {
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

    @ApiProperty({ description: '中文名称', example: '中国' })
    @IsString({ message: '中文名称必须是字符串' })
    @IsNotEmpty({ message: '中文名称必填' })
    @MaxLength(64, { message: '中文名称长度不能超过64位' })
    cnName: string

    @ApiProperty({ description: '英文名称', example: 'China' })
    @IsString({ message: '英文名称必须是字符串' })
    @IsNotEmpty({ message: '英文名称必填' })
    @MaxLength(64, { message: '英文名称长度不能超过64位' })
    enName: string

    @ApiProperty({
        description: TbFinanceCountryStatusComment,
        enum: TbFinanceCountryStatus,
        enumName: 'TbFinanceCountryStatus',
        example: TbFinanceCountryStatus.ENABLE
    })
    @IsEnum(TbFinanceCountryStatus, { message: '国家/地区状态格式错误' })
    status: TbFinanceCountryStatus
}

@Index('uk_tb_finance_country_code_mcc', ['code', 'mcc'], { unique: true })
@Index('idx_tb_finance_country_status', ['status'])
@Entity({ name: 'tb_finance_country', comment: '财务国家地区表' })
export class TbFinanceCountry extends DataBaseAdapter {
    @Column({ name: TbFinanceCountryColumn.CODE, type: 'varchar', length: 10, nullable: false, comment: '国家/地区国际区号' })
    code: string

    @Column({ name: TbFinanceCountryColumn.MCC, type: 'varchar', length: 4, nullable: false, comment: '移动国家代码' })
    mcc: string

    @Column({ name: TbFinanceCountryColumn.CN_NAME, type: 'varchar', length: 64, nullable: false, comment: '中文名称' })
    cnName: string

    @Column({ name: TbFinanceCountryColumn.EN_NAME, type: 'varchar', length: 64, nullable: false, comment: '英文名称' })
    enName: string

    @Column({
        name: TbFinanceCountryColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbFinanceCountryStatusComment
    })
    status: TbFinanceCountryStatus
}
