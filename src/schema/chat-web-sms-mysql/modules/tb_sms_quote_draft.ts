import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, DateWithColumn, defineEnumMetadata, BigintNumberTransformer } from '@/utils'

export enum TbSmsQuoteDraftColumn {
    KEY_ID = 'key_id',
    DRAFT_BATCH_ID = 'draft_batch_id',
    USER_KEY_ID = 'user_key_id',
    APP_KEY_ID = 'app_key_id',
    APP_ID = 'app_id',
    USER_ALIAS = 'user_alias',
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
    SOURCE = 'source',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSmsQuoteDraftSource {
    ADDITION = 'addition',
    EXISTING = 'existing'
}

export const TbSmsQuoteDraftSourceDefinition = defineEnumMetadata(TbSmsQuoteDraftSource, '报价来源', {
    [TbSmsQuoteDraftSource.ADDITION]: { label: '新增', description: '本次新增的国家或地区报价', type: 'cyan' },
    [TbSmsQuoteDraftSource.EXISTING]: { label: '已有', description: '从现有有效报价复制', type: 'blue' }
})

export enum TbSmsQuoteDraftChangeStatus {
    UNCHANGED = 'unchanged',
    ADDITION = 'addition'
}

export const TbSmsQuoteDraftChangeStatusDefinition = defineEnumMetadata(TbSmsQuoteDraftChangeStatus, '报价变更状态', {
    [TbSmsQuoteDraftChangeStatus.UNCHANGED]: { label: '未变', description: '与现有有效报价一致', type: 'default' },
    [TbSmsQuoteDraftChangeStatus.ADDITION]: { label: '新增', description: '本次新增的国家或地区报价', type: 'success' }
})

export class TbSmsQuoteDraftDto extends DataBaseByDto {
    @ApiProperty({ description: '草稿批次ID', example: '4b5be331-04bc-494b-9192-e7f62a377f52' })
    @IsUUID('4', { message: '草稿批次ID格式错误' })
    draftBatchId: string

    @ApiProperty({ description: 'CRM 客户主键', example: 10241000 })
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: 'SMS 短信应用主键', example: 1 })
    @IsInt({ message: '短信应用主键必须是整数' })
    @Min(1, { message: '短信应用主键必须大于0' })
    appKeyId: number

    @ApiProperty({ description: '应用ID快照', example: 'SMS9F2A8B31' })
    @IsString({ message: '应用ID必须是字符串' })
    @IsNotEmpty({ message: '应用ID必填' })
    @MaxLength(32, { message: '应用ID长度不能超过32位' })
    appId: string

    @ApiProperty({ description: '客户别名快照', required: false, example: '华东客户' })
    @IsOptional()
    @IsString({ message: '客户别名必须是字符串' })
    @MaxLength(64, { message: '客户别名长度不能超过64位' })
    userAlias: string

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
    @Length(1, 16, { message: '报价币种长度不能超过16位' })
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

    @ApiProperty({ description: '生效时间', required: false, example: '2026-09-01 00:00:00' })
    @IsOptional()
    @IsDateString({}, { message: '生效时间格式错误' })
    effectiveTime: Date

    @ApiProperty({ description: '失效时间', required: false, example: '2026-12-31 23:59:59' })
    @IsOptional()
    @IsDateString({}, { message: '失效时间格式错误' })
    expiryTime: Date

    @ApiProperty({
        description: TbSmsQuoteDraftSourceDefinition.comment,
        enum: TbSmsQuoteDraftSource,
        enumName: 'TbSmsQuoteDraftSource'
    })
    @IsEnum(TbSmsQuoteDraftSource, { message: '报价来源格式错误' })
    source: TbSmsQuoteDraftSource

    @ApiProperty({ description: '备注', required: false, example: '客户专属报价草稿' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('uk_tb_sms_quote_draft_batch_country', ['draftBatchId', 'countryKeyId'], { unique: true })
@Index('idx_tb_sms_quote_draft_user_app', ['userKeyId', 'appKeyId'])
@Index('idx_tb_sms_quote_draft_create_by', ['createBy'])
@Entity({ name: 'tb_sms_quote_draft', comment: 'SMS 短信报价草稿表' })
export class TbSmsQuoteDraft extends DataBaseByAdapter {
    @Column({ name: TbSmsQuoteDraftColumn.DRAFT_BATCH_ID, type: 'varchar', length: 36, nullable: false, comment: '草稿批次ID' })
    draftBatchId: string

    @Column({ name: TbSmsQuoteDraftColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'CRM 客户主键' })
    userKeyId: number

    @Column({ name: TbSmsQuoteDraftColumn.APP_KEY_ID, type: 'int', nullable: false, comment: 'SMS 短信应用主键' })
    appKeyId: number

    @Column({ name: TbSmsQuoteDraftColumn.APP_ID, type: 'varchar', length: 32, nullable: false, comment: '应用ID快照' })
    appId: string

    @Column({ name: TbSmsQuoteDraftColumn.USER_ALIAS, type: 'varchar', length: 64, nullable: true, comment: '客户别名快照' })
    userAlias: string

    @Column({ name: TbSmsQuoteDraftColumn.APP_ALIAS, type: 'varchar', length: 64, nullable: false, comment: '应用别名快照' })
    appAlias: string

    @Column({ name: TbSmsQuoteDraftColumn.COUNTRY_KEY_ID, type: 'int', nullable: false, comment: 'Finance 国家/地区主键' })
    countryKeyId: number

    @Column({ name: TbSmsQuoteDraftColumn.CODE, type: 'varchar', length: 10, nullable: false, comment: '国家/地区国际区号' })
    code: string

    @Column({ name: TbSmsQuoteDraftColumn.MCC, type: 'varchar', length: 4, nullable: false, comment: '移动国家代码' })
    mcc: string

    @Column({
        name: TbSmsQuoteDraftColumn.UP_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '上行短信售价USD（放大百万倍存储）'
    })
    upUsd: number

    @Column({
        name: TbSmsQuoteDraftColumn.DOWN_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '下行短信售价USD（放大百万倍存储）'
    })
    downUsd: number

    @Column({ name: TbSmsQuoteDraftColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '报价币种' })
    currency: string

    @Column({
        name: TbSmsQuoteDraftColumn.UP_LOCAL,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '上行短信本币售价（放大百万倍存储）'
    })
    upLocal: number

    @Column({
        name: TbSmsQuoteDraftColumn.DOWN_LOCAL,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '下行短信本币售价（放大百万倍存储）'
    })
    downLocal: number

    @Column({
        name: TbSmsQuoteDraftColumn.EXCHANGE_RATE,
        type: 'decimal',
        precision: 16,
        scale: 6,
        nullable: false,
        comment: 'USD 到报价币种汇率'
    })
    exchangeRate: number

    @Column({ name: TbSmsQuoteDraftColumn.EXCHANGE_DATE, type: 'date', nullable: false, comment: '汇率日期' })
    exchangeDate: string

    @DateWithColumn(Column, {
        name: TbSmsQuoteDraftColumn.EFFECTIVE_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '生效时间'
    })
    effectiveTime: Date

    @DateWithColumn(Column, {
        name: TbSmsQuoteDraftColumn.EXPIRY_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '失效时间'
    })
    expiryTime: Date

    @Column({
        name: TbSmsQuoteDraftColumn.SOURCE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSmsQuoteDraftSourceDefinition.comment
    })
    source: TbSmsQuoteDraftSource

    @Column({ name: TbSmsQuoteDraftColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
