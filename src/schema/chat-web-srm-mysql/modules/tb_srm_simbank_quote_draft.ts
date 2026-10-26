import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, DateWithColumn, defineEnumMetadata, BigintNumberTransformer } from '@/utils'

export enum TbSrmSimbankQuoteDraftColumn {
    KEY_ID = 'key_id',
    DRAFT_BATCH_ID = 'draft_batch_id',
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
    SOURCE = 'source',
    STATUS = 'status',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmSimbankQuoteDraftSource {
    ADDITION = 'addition',
    EXISTING = 'existing'
}

export const TbSrmSimbankQuoteDraftSourceDefinition = defineEnumMetadata(TbSrmSimbankQuoteDraftSource, '报价来源', {
    [TbSrmSimbankQuoteDraftSource.ADDITION]: { label: 'NEW', description: '本次新增的国家或地区报价', type: 'success' },
    [TbSrmSimbankQuoteDraftSource.EXISTING]: { label: 'CURRENT', description: '从现有有效报价复制', type: 'info' }
})

export enum TbSrmSimbankQuoteDraftChangeStatus {
    NEW = 'NEW',
    CURRENT = 'CURRENT',
    INCREASE = 'INCREASE',
    DECREASE = 'DECREASE'
}

export const TbSrmSimbankQuoteDraftChangeStatusDefinition = defineEnumMetadata(TbSrmSimbankQuoteDraftChangeStatus, '报价变更状态', {
    [TbSrmSimbankQuoteDraftChangeStatus.NEW]: { label: 'NEW', description: '当前 simbank 该国家/地区第一次报价', type: 'success' },
    [TbSrmSimbankQuoteDraftChangeStatus.CURRENT]: { label: 'CURRENT', description: '与现有有效报价价格一致', type: 'info' },
    [TbSrmSimbankQuoteDraftChangeStatus.INCREASE]: { label: 'INCREASE', description: '价格高于现有有效报价', type: 'error' },
    [TbSrmSimbankQuoteDraftChangeStatus.DECREASE]: { label: 'DECREASE', description: '价格低于现有有效报价', type: 'warning' }
})

export enum TbSrmSimbankQuoteDraftStatus {
    DELETED = 'deleted',
    ENABLE = 'enable'
}

export const TbSrmSimbankQuoteDraftStatusDefinition = defineEnumMetadata(TbSrmSimbankQuoteDraftStatus, '报价草稿状态', {
    [TbSrmSimbankQuoteDraftStatus.ENABLE]: { label: 'ENABLE', description: '草稿参与预览和发布', type: 'success' },
    [TbSrmSimbankQuoteDraftStatus.DELETED]: { label: 'DELETED', description: '草稿已软删除，可恢复，不参与预览和发布', type: 'error' }
})

export class TbSrmSimbankQuoteDraftDto extends DataBaseByDto {
    @ApiProperty({ description: '草稿批次ID', example: '4b5be331-04bc-494b-9192-e7f62a377f52' })
    @IsUUID('4', { message: '草稿批次ID格式错误' })
    draftBatchId: string

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
    @Length(1, 16, { message: '报价币种长度不能超过16位' })
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

    @ApiProperty({ description: '生效时间', required: false, example: '2026-09-01 00:00:00' })
    @IsOptional()
    @IsDateString({}, { message: '生效时间格式错误' })
    effectiveTime: Date

    @ApiProperty({ description: '失效时间', required: false, example: '2026-12-31 23:59:59' })
    @IsOptional()
    @IsDateString({}, { message: '失效时间格式错误' })
    expiryTime: Date

    @ApiProperty({
        description: TbSrmSimbankQuoteDraftSourceDefinition.comment,
        enum: TbSrmSimbankQuoteDraftSource,
        enumName: 'TbSrmSimbankQuoteDraftSource'
    })
    @IsEnum(TbSrmSimbankQuoteDraftSource, { message: '报价来源格式错误' })
    source: TbSrmSimbankQuoteDraftSource

    @ApiProperty({
        description: TbSrmSimbankQuoteDraftStatusDefinition.comment,
        enum: TbSrmSimbankQuoteDraftStatus,
        enumName: 'TbSrmSimbankQuoteDraftStatus'
    })
    @IsEnum(TbSrmSimbankQuoteDraftStatus, { message: '报价草稿状态格式错误' })
    status: TbSrmSimbankQuoteDraftStatus

    @ApiProperty({ description: '备注', required: false, example: 'simbank 报价草稿' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('uk_tb_srm_simbank_quote_draft_batch_country', ['draftBatchId', 'countryKeyId'], { unique: true })
@Index('idx_tb_srm_simbank_quote_draft_user_simbank', ['userKeyId', 'simbankKeyId'])
@Index('idx_tb_srm_simbank_quote_draft_batch_status', ['draftBatchId', 'status'])
@Index('idx_tb_srm_simbank_quote_draft_create_by', ['createBy'])
@Entity({ name: 'tb_srm_simbank_quote_draft', comment: 'SRM 供应商 simbank 报价草稿表' })
export class TbSrmSimbankQuoteDraft extends DataBaseByAdapter {
    @Column({ name: TbSrmSimbankQuoteDraftColumn.DRAFT_BATCH_ID, type: 'varchar', length: 36, nullable: false, comment: '草稿批次ID' })
    draftBatchId: string

    @Column({ name: TbSrmSimbankQuoteDraftColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'SRM 供应商主键' })
    userKeyId: number

    @Column({ name: TbSrmSimbankQuoteDraftColumn.SIMBANK_KEY_ID, type: 'int', nullable: false, comment: 'SRM simbank 设备主键' })
    simbankKeyId: number

    @Column({ name: TbSrmSimbankQuoteDraftColumn.USER_ALIAS, type: 'varchar', length: 64, nullable: true, comment: '供应商别名快照' })
    userAlias: string

    @Column({
        name: TbSrmSimbankQuoteDraftColumn.SIMBANK_ALIAS,
        type: 'varchar',
        length: 64,
        nullable: true,
        comment: 'simbank 设备别名快照'
    })
    simbankAlias: string

    @Column({ name: TbSrmSimbankQuoteDraftColumn.COUNTRY_KEY_ID, type: 'int', nullable: false, comment: 'Skyline 国家/地区主键' })
    countryKeyId: number

    @Column({ name: TbSrmSimbankQuoteDraftColumn.CODE, type: 'varchar', length: 10, nullable: false, comment: '国家/地区国际区号' })
    code: string

    @Column({ name: TbSrmSimbankQuoteDraftColumn.MCC, type: 'varchar', length: 4, nullable: false, comment: '移动国家代码' })
    mcc: string

    @Column({
        name: TbSrmSimbankQuoteDraftColumn.UP_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '上行短信成本价USD（放大百万倍存储）'
    })
    upUsd: number

    @Column({
        name: TbSrmSimbankQuoteDraftColumn.DOWN_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '下行短信成本价USD（放大百万倍存储）'
    })
    downUsd: number

    @Column({ name: TbSrmSimbankQuoteDraftColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '报价币种' })
    currency: string

    @Column({
        name: TbSrmSimbankQuoteDraftColumn.UP_LOCAL,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '上行短信本币成本价（放大百万倍存储）'
    })
    upLocal: number

    @Column({
        name: TbSrmSimbankQuoteDraftColumn.DOWN_LOCAL,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '下行短信本币成本价（放大百万倍存储）'
    })
    downLocal: number

    @Column({
        name: TbSrmSimbankQuoteDraftColumn.EXCHANGE_RATE,
        type: 'decimal',
        precision: 16,
        scale: 6,
        nullable: false,
        comment: 'USD 到报价币种汇率'
    })
    exchangeRate: number

    @Column({ name: TbSrmSimbankQuoteDraftColumn.EXCHANGE_DATE, type: 'date', nullable: false, comment: '汇率日期' })
    exchangeDate: string

    @DateWithColumn(Column, {
        name: TbSrmSimbankQuoteDraftColumn.EFFECTIVE_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '生效时间'
    })
    effectiveTime: Date

    @DateWithColumn(Column, {
        name: TbSrmSimbankQuoteDraftColumn.EXPIRY_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '失效时间'
    })
    expiryTime: Date

    @Column({
        name: TbSrmSimbankQuoteDraftColumn.SOURCE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSrmSimbankQuoteDraftSourceDefinition.comment
    })
    source: TbSrmSimbankQuoteDraftSource

    @Column({
        name: TbSrmSimbankQuoteDraftColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmSimbankQuoteDraftStatus.ENABLE,
        comment: TbSrmSimbankQuoteDraftStatusDefinition.comment
    })
    status: TbSrmSimbankQuoteDraftStatus

    @Column({ name: TbSrmSimbankQuoteDraftColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
