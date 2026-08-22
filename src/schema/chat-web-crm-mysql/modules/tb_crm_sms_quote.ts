import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, DateWithColumn, defineEnumMetadata } from '@/utils'

export enum TbCrmSmsQuoteColumn {
    KEY_ID = 'key_id',
    CONSUMER_KEY_ID = 'consumer_key_id',
    APPLICATION_KEY_ID = 'application_key_id',
    APP_ID = 'app_id',
    CONSUMER_ALIAS = 'consumer_alias',
    APP_ALIAS = 'app_alias',
    COUNTRY_KEY_ID = 'country_key_id',
    CODE = 'code',
    MCC = 'mcc',
    UP_USD = 'up_usd',
    DOWN_USD = 'down_usd',
    CURRENCY = 'currency',
    UP_LOCAL = 'up_local',
    DOWN_LOCAL = 'down_local',
    EXCHANGE_RATE = 'exchange_rate',
    EXCHANGE_DATE = 'exchange_date',
    EFFECTIVE_TIME = 'effective_time',
    EXPIRY_TIME = 'expiry_time',
    STATUS = 'status',
    PUBLISHED_TIME = 'published_time',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbCrmSmsQuoteStatus {
    DELETED = 'deleted',
    EFFECTIVE = 'effective',
    PENDING = 'pending'
}

export const TbCrmSmsQuoteStatusDefinition = defineEnumMetadata(TbCrmSmsQuoteStatus, '短信报价状态', {
    [TbCrmSmsQuoteStatus.DELETED]: { label: '已删除', description: '报价已停止使用' },
    [TbCrmSmsQuoteStatus.EFFECTIVE]: { label: '已生效', description: '报价当前有效' },
    [TbCrmSmsQuoteStatus.PENDING]: { label: '待生效', description: '报价等待生效时间' }
})

export const {
    metadata: TbCrmSmsQuoteStatusMetadata,
    options: TbCrmSmsQuoteStatusOptions,
    count: TbCrmSmsQuoteStatusCount,
    comment: TbCrmSmsQuoteStatusComment
} = TbCrmSmsQuoteStatusDefinition

export class TbCrmSmsQuoteDto extends DataBaseByDto {
    @ApiProperty({ description: 'Account 客户主键', example: 5181000 })
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    consumerKeyId: number

    @ApiProperty({ description: 'CRM 短信应用主键', example: 1 })
    @IsInt({ message: '短信应用主键必须是整数' })
    @Min(1, { message: '短信应用主键必须大于0' })
    applicationKeyId: number

    @ApiProperty({ description: '应用ID快照', example: 'SMS9F2A8B31' })
    @IsString({ message: '应用ID必须是字符串' })
    @IsNotEmpty({ message: '应用ID必填' })
    @MaxLength(32, { message: '应用ID长度不能超过32位' })
    appId: string

    @ApiProperty({ description: '客户别名快照', required: false })
    @IsOptional()
    @IsString({ message: '客户别名必须是字符串' })
    @MaxLength(64, { message: '客户别名长度不能超过64位' })
    consumerAlias: string

    @ApiProperty({ description: '应用别名快照', example: 'LYNKS-OTP' })
    @IsString({ message: '应用别名必须是字符串' })
    @IsNotEmpty({ message: '应用别名必填' })
    @MaxLength(64, { message: '应用别名长度不能超过64位' })
    appAlias: string

    @ApiProperty({ description: 'Finance 国家/地区主键', example: 1 })
    @IsInt({ message: '国家/地区主键必须是整数' })
    @Min(1, { message: '国家/地区主键必须大于0' })
    countryKeyId: number

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

    @ApiProperty({ description: '上行短信售价USD（放大百万倍存储）', example: 30000 })
    @IsInt({ message: '上行短信售价必须是整数' })
    @Min(0, { message: '上行短信售价不能小于0' })
    upUsd: number

    @ApiProperty({ description: '下行短信售价USD（放大百万倍存储）', example: 50000 })
    @IsInt({ message: '下行短信售价必须是整数' })
    @Min(0, { message: '下行短信售价不能小于0' })
    downUsd: number

    @ApiProperty({ description: '报价币种', example: 'USD' })
    @IsString({ message: '报价币种必须是字符串' })
    @MaxLength(16, { message: '报价币种长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '上行短信本币售价（放大百万倍存储）', example: 30000 })
    @IsInt({ message: '上行短信本币售价必须是整数' })
    @Min(0, { message: '上行短信本币售价不能小于0' })
    upLocal: number

    @ApiProperty({ description: '下行短信本币售价（放大百万倍存储）', example: 50000 })
    @IsInt({ message: '下行短信本币售价必须是整数' })
    @Min(0, { message: '下行短信本币售价不能小于0' })
    downLocal: number

    @ApiProperty({ description: 'USD 到报价币种汇率', example: 1 })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 6 }, { message: '汇率格式错误' })
    @Min(0, { message: '汇率不能小于0' })
    exchangeRate: number

    @ApiProperty({ description: '汇率日期', example: '2026-08-23' })
    @IsDateString({}, { message: '汇率日期格式错误' })
    exchangeDate: string

    @ApiProperty({ description: '生效时间', example: '2026-09-01 00:00:00' })
    @IsDateString({}, { message: '生效时间格式错误' })
    effectiveTime: Date

    @ApiProperty({ description: '失效时间', required: false, example: '2026-12-31 23:59:59' })
    @IsOptional()
    @IsDateString({}, { message: '失效时间格式错误' })
    expiryTime: Date

    @ApiProperty({ description: TbCrmSmsQuoteStatusComment, enum: TbCrmSmsQuoteStatus, enumName: 'TbCrmSmsQuoteStatus' })
    @IsEnum(TbCrmSmsQuoteStatus, { message: '短信报价状态格式错误' })
    status: TbCrmSmsQuoteStatus

    @ApiProperty({ description: '发布时间', example: '2026-08-23 12:00:00' })
    @IsDateString({}, { message: '发布时间格式错误' })
    publishedTime: Date

    @ApiProperty({ description: '备注', required: false })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('idx_tb_crm_sms_quote_consumer_app', ['consumerKeyId', 'applicationKeyId'])
@Index('idx_tb_crm_sms_quote_country_key_id', ['countryKeyId'])
@Index('idx_tb_crm_sms_quote_status_effective_time', ['status', 'effectiveTime'])
@Index('idx_tb_crm_sms_quote_published_time', ['publishedTime'])
@Entity({ name: 'tb_crm_sms_quote', comment: 'CRM 短信正式报价表' })
export class TbCrmSmsQuote extends DataBaseByAdapter {
    @Column({ name: TbCrmSmsQuoteColumn.CONSUMER_KEY_ID, type: 'int', nullable: false, comment: 'Account 客户主键' })
    consumerKeyId: number

    @Column({ name: TbCrmSmsQuoteColumn.APPLICATION_KEY_ID, type: 'int', nullable: false, comment: 'CRM 短信应用主键' })
    applicationKeyId: number

    @Column({ name: TbCrmSmsQuoteColumn.APP_ID, type: 'varchar', length: 32, nullable: false, comment: '应用ID快照' })
    appId: string

    @Column({ name: TbCrmSmsQuoteColumn.CONSUMER_ALIAS, type: 'varchar', length: 64, nullable: true, comment: '客户别名快照' })
    consumerAlias: string

    @Column({ name: TbCrmSmsQuoteColumn.APP_ALIAS, type: 'varchar', length: 64, nullable: false, comment: '应用别名快照' })
    appAlias: string

    @Column({ name: TbCrmSmsQuoteColumn.COUNTRY_KEY_ID, type: 'int', nullable: false, comment: 'Finance 国家/地区主键' })
    countryKeyId: number

    @Column({ name: TbCrmSmsQuoteColumn.CODE, type: 'varchar', length: 10, nullable: false, comment: '国家/地区国际区号' })
    code: string

    @Column({ name: TbCrmSmsQuoteColumn.MCC, type: 'varchar', length: 4, nullable: false, comment: '移动国家代码' })
    mcc: string

    @Column({ name: TbCrmSmsQuoteColumn.UP_USD, type: 'bigint', nullable: false, comment: '上行短信售价USD（放大百万倍存储）' })
    upUsd: number

    @Column({ name: TbCrmSmsQuoteColumn.DOWN_USD, type: 'bigint', nullable: false, comment: '下行短信售价USD（放大百万倍存储）' })
    downUsd: number

    @Column({ name: TbCrmSmsQuoteColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '报价币种' })
    currency: string

    @Column({ name: TbCrmSmsQuoteColumn.UP_LOCAL, type: 'bigint', nullable: false, comment: '上行短信本币售价（放大百万倍存储）' })
    upLocal: number

    @Column({ name: TbCrmSmsQuoteColumn.DOWN_LOCAL, type: 'bigint', nullable: false, comment: '下行短信本币售价（放大百万倍存储）' })
    downLocal: number

    @Column({
        name: TbCrmSmsQuoteColumn.EXCHANGE_RATE,
        type: 'decimal',
        precision: 16,
        scale: 6,
        nullable: false,
        comment: 'USD 到报价币种汇率'
    })
    exchangeRate: number

    @Column({ name: TbCrmSmsQuoteColumn.EXCHANGE_DATE, type: 'date', nullable: false, comment: '汇率日期' })
    exchangeDate: string

    @DateWithColumn(Column, {
        name: TbCrmSmsQuoteColumn.EFFECTIVE_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '生效时间'
    })
    effectiveTime: Date

    @DateWithColumn(Column, {
        name: TbCrmSmsQuoteColumn.EXPIRY_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '失效时间'
    })
    expiryTime: Date

    @Column({ name: TbCrmSmsQuoteColumn.STATUS, type: 'varchar', length: 32, nullable: false, comment: TbCrmSmsQuoteStatusComment })
    status: TbCrmSmsQuoteStatus

    @DateWithColumn(Column, {
        name: TbCrmSmsQuoteColumn.PUBLISHED_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '发布时间'
    })
    publishedTime: Date

    @Column({ name: TbCrmSmsQuoteColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
