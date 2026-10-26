import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, DateWithColumn, defineEnumMetadata, BigintNumberTransformer } from '@/utils'

export enum TbSrmSimbankQuoteColumn {
    KEY_ID = 'key_id',
    USER_KEY_ID = 'user_key_id',
    SIMBANK_KEY_ID = 'simbank_key_id',
    USER_ALIAS = 'user_alias',
    SIMBANK_ALIAS = 'simbank_alias',
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

export enum TbSrmSimbankQuoteStatus {
    DELETED = 'deleted',
    EFFECTIVE = 'effective',
    EXPIRED = 'expired',
    PENDING = 'pending'
}

export const TbSrmSimbankQuoteStatusDefinition = defineEnumMetadata(TbSrmSimbankQuoteStatus, 'simbank 报价状态', {
    [TbSrmSimbankQuoteStatus.EFFECTIVE]: { label: '已生效', description: '报价当前有效', type: 'success' },
    [TbSrmSimbankQuoteStatus.PENDING]: { label: '待生效', description: '报价等待生效时间', type: 'warning' },
    [TbSrmSimbankQuoteStatus.EXPIRED]: { label: '已失效', description: '报价已到失效时间', type: 'error' },
    [TbSrmSimbankQuoteStatus.DELETED]: { label: '已作废', description: '报价被手动作废或在生效前被替换', type: 'default' }
})

export class TbSrmSimbankQuoteDto extends DataBaseByDto {
    @ApiProperty({ description: 'SRM 供应商主键', example: 10241000 })
    @IsInt({ message: '供应商主键必须是整数' })
    @Min(1, { message: '供应商主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: 'SRM simbank 设备主键', example: 100201 })
    @IsInt({ message: 'simbank 设备主键必须是整数' })
    @Min(1, { message: 'simbank 设备主键必须大于0' })
    simbankKeyId: number

    @ApiProperty({ description: '供应商别名快照', required: false, example: 'SSK1233A7K9' })
    @IsOptional()
    @IsString({ message: '供应商别名必须是字符串' })
    @MaxLength(64, { message: '供应商别名长度不能超过64位' })
    userAlias: string

    @ApiProperty({ description: 'simbank 设备别名快照', required: false, example: 'SSK1233SMSA002' })
    @IsOptional()
    @IsString({ message: 'simbank 设备别名必须是字符串' })
    @MaxLength(64, { message: 'simbank 设备别名长度不能超过64位' })
    simbankAlias: string

    @ApiProperty({ description: 'Skyline 国家/地区主键', example: 1 })
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

    @ApiProperty({ description: '上行短信成本价USD（放大百万倍存储）', example: 30000 })
    @IsInt({ message: '上行短信成本价必须是整数' })
    @Min(0, { message: '上行短信成本价不能小于0' })
    upUsd: number

    @ApiProperty({ description: '下行短信成本价USD（放大百万倍存储）', example: 50000 })
    @IsInt({ message: '下行短信成本价必须是整数' })
    @Min(0, { message: '下行短信成本价不能小于0' })
    downUsd: number

    @ApiProperty({ description: '报价币种', example: 'USD' })
    @IsString({ message: '报价币种必须是字符串' })
    @MaxLength(16, { message: '报价币种长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '上行短信本币成本价（放大百万倍存储）', example: 30000 })
    @IsInt({ message: '上行短信本币成本价必须是整数' })
    @Min(0, { message: '上行短信本币成本价不能小于0' })
    upLocal: number

    @ApiProperty({ description: '下行短信本币成本价（放大百万倍存储）', example: 50000 })
    @IsInt({ message: '下行短信本币成本价必须是整数' })
    @Min(0, { message: '下行短信本币成本价不能小于0' })
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

    @ApiProperty({
        description: TbSrmSimbankQuoteStatusDefinition.comment,
        enum: TbSrmSimbankQuoteStatus,
        enumName: 'TbSrmSimbankQuoteStatus'
    })
    @IsEnum(TbSrmSimbankQuoteStatus, { message: 'simbank 报价状态格式错误' })
    status: TbSrmSimbankQuoteStatus

    @ApiProperty({ description: '发布时间', example: '2026-08-23 12:00:00' })
    @IsDateString({}, { message: '发布时间格式错误' })
    publishedTime: Date

    @ApiProperty({ description: '备注', required: false, example: 'simbank 正式报价' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('idx_tb_srm_simbank_quote_user_simbank', ['userKeyId', 'simbankKeyId'])
@Index('idx_tb_srm_simbank_quote_country_key_id', ['countryKeyId'])
@Index('idx_tb_srm_simbank_quote_status_effective_time', ['status', 'effectiveTime'])
@Index('idx_tb_srm_simbank_quote_published_time', ['publishedTime'])
@Entity({ name: 'tb_srm_simbank_quote', comment: 'SRM 供应商 simbank 正式报价表' })
export class TbSrmSimbankQuote extends DataBaseByAdapter {
    @Column({ name: TbSrmSimbankQuoteColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'SRM 供应商主键' })
    userKeyId: number

    @Column({ name: TbSrmSimbankQuoteColumn.SIMBANK_KEY_ID, type: 'int', nullable: false, comment: 'SRM simbank 设备主键' })
    simbankKeyId: number

    @Column({ name: TbSrmSimbankQuoteColumn.USER_ALIAS, type: 'varchar', length: 64, nullable: true, comment: '供应商别名快照' })
    userAlias: string

    @Column({ name: TbSrmSimbankQuoteColumn.SIMBANK_ALIAS, type: 'varchar', length: 64, nullable: true, comment: 'simbank 设备别名快照' })
    simbankAlias: string

    @Column({ name: TbSrmSimbankQuoteColumn.COUNTRY_KEY_ID, type: 'int', nullable: false, comment: 'Skyline 国家/地区主键' })
    countryKeyId: number

    @Column({ name: TbSrmSimbankQuoteColumn.CODE, type: 'varchar', length: 10, nullable: false, comment: '国家/地区国际区号' })
    code: string

    @Column({ name: TbSrmSimbankQuoteColumn.MCC, type: 'varchar', length: 4, nullable: false, comment: '移动国家代码' })
    mcc: string

    @Column({
        name: TbSrmSimbankQuoteColumn.UP_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '上行短信成本价USD（放大百万倍存储）'
    })
    upUsd: number

    @Column({
        name: TbSrmSimbankQuoteColumn.DOWN_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '下行短信成本价USD（放大百万倍存储）'
    })
    downUsd: number

    @Column({ name: TbSrmSimbankQuoteColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '报价币种' })
    currency: string

    @Column({
        name: TbSrmSimbankQuoteColumn.UP_LOCAL,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '上行短信本币成本价（放大百万倍存储）'
    })
    upLocal: number

    @Column({
        name: TbSrmSimbankQuoteColumn.DOWN_LOCAL,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '下行短信本币成本价（放大百万倍存储）'
    })
    downLocal: number

    @Column({
        name: TbSrmSimbankQuoteColumn.EXCHANGE_RATE,
        type: 'decimal',
        precision: 16,
        scale: 6,
        nullable: false,
        comment: 'USD 到报价币种汇率'
    })
    exchangeRate: number

    @Column({ name: TbSrmSimbankQuoteColumn.EXCHANGE_DATE, type: 'date', nullable: false, comment: '汇率日期' })
    exchangeDate: string

    @DateWithColumn(Column, {
        name: TbSrmSimbankQuoteColumn.EFFECTIVE_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '生效时间'
    })
    effectiveTime: Date

    @DateWithColumn(Column, {
        name: TbSrmSimbankQuoteColumn.EXPIRY_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '失效时间'
    })
    expiryTime: Date

    @Column({
        name: TbSrmSimbankQuoteColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSrmSimbankQuoteStatusDefinition.comment
    })
    status: TbSrmSimbankQuoteStatus

    @DateWithColumn(Column, {
        name: TbSrmSimbankQuoteColumn.PUBLISHED_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '发布时间'
    })
    publishedTime: Date

    @Column({ name: TbSrmSimbankQuoteColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
