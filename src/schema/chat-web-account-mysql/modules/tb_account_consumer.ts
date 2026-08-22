import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

export enum TbAccountConsumerColumn {
    KEY_ID = 'key_id',
    UID = 'uid',
    OWNER_USER_UID = 'owner_user_uid',
    NAME = 'name',
    ALIAS = 'alias',
    BRAND_KEY_ID = 'brand_key_id',
    CURRENCY = 'currency',
    EMAIL = 'email',
    PHONE = 'phone',
    STATUS = 'status',
    PAY_MODE = 'pay_mode',
    CLASS_TYPE = 'class_type',
    BALANCE = 'balance',
    BALANCE_USD = 'balance_usd',
    CREDIT = 'credit',
    CREDIT_USD = 'credit_usd',
    LEVEL = 'level',
    STAGE = 'stage',
    AUTH_STATUS = 'auth_status',
    SOURCE = 'source',
    REMARK = 'remark',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbAccountConsumerStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbAccountConsumerStatusDefinition = defineEnumMetadata(TbAccountConsumerStatus, '客户状态', {
    [TbAccountConsumerStatus.DISABLE]: { label: '禁用', description: '客户账号不可用' },
    [TbAccountConsumerStatus.ENABLE]: { label: '启用', description: '客户账号正常使用' }
})

export enum TbAccountConsumerPayMode {
    POSTPAID = 'postpaid',
    PREPAID = 'prepaid'
}

export const TbAccountConsumerPayModeDefinition = defineEnumMetadata(TbAccountConsumerPayMode, '付款模式', {
    [TbAccountConsumerPayMode.POSTPAID]: { label: '后付', description: '账期后付费' },
    [TbAccountConsumerPayMode.PREPAID]: { label: '预付', description: '账户预付费' }
})

export enum TbAccountConsumerClassType {
    COMMON = 'common',
    COOPERATE = 'cooperate'
}

export const TbAccountConsumerClassTypeDefinition = defineEnumMetadata(TbAccountConsumerClassType, '客户类型', {
    [TbAccountConsumerClassType.COMMON]: { label: '普通客户', description: '普通业务客户' },
    [TbAccountConsumerClassType.COOPERATE]: { label: '推广客户', description: '合作推广客户' }
})

export enum TbAccountConsumerStage {
    AUTHENTICATE = 'authenticate',
    CHARGE = 'charge',
    CLUETRAIL = 'cluetrail',
    COOPERATE = 'cooperate',
    INTENTION = 'intention',
    PRODUCTION = 'production',
    TESTING = 'testing'
}

export const TbAccountConsumerStageDefinition = defineEnumMetadata(TbAccountConsumerStage, '客户阶段', {
    [TbAccountConsumerStage.AUTHENTICATE]: { label: '认证阶段', description: '客户正在认证' },
    [TbAccountConsumerStage.CHARGE]: { label: '充值阶段', description: '客户准备充值' },
    [TbAccountConsumerStage.CLUETRAIL]: { label: '线索阶段', description: '客户处于线索跟进' },
    [TbAccountConsumerStage.COOPERATE]: { label: '价值阶段', description: '客户已形成稳定价值' },
    [TbAccountConsumerStage.INTENTION]: { label: '意向阶段', description: '客户已有合作意向' },
    [TbAccountConsumerStage.PRODUCTION]: { label: '生产阶段', description: '客户已进入生产' },
    [TbAccountConsumerStage.TESTING]: { label: '测试阶段', description: '客户正在业务测试' }
})

export enum TbAccountConsumerAuthStatus {
    PENDING = 'pending',
    REJECTED = 'rejected',
    UNVERIFIED = 'unverified',
    VERIFIED = 'verified'
}

export const TbAccountConsumerAuthStatusDefinition = defineEnumMetadata(TbAccountConsumerAuthStatus, '认证状态', {
    [TbAccountConsumerAuthStatus.PENDING]: { label: '认证中', description: '认证资料审核中' },
    [TbAccountConsumerAuthStatus.REJECTED]: { label: '认证失败', description: '认证资料未通过' },
    [TbAccountConsumerAuthStatus.UNVERIFIED]: { label: '未认证', description: '尚未提交认证' },
    [TbAccountConsumerAuthStatus.VERIFIED]: { label: '已认证', description: '认证已通过' }
})

export enum TbAccountConsumerSource {
    MANUAL = 'manual',
    PLATFORM = 'platform'
}

export const TbAccountConsumerSourceDefinition = defineEnumMetadata(TbAccountConsumerSource, '注册来源', {
    [TbAccountConsumerSource.MANUAL]: { label: '手动创建', description: '管理端人工创建' },
    [TbAccountConsumerSource.PLATFORM]: { label: '平台注册', description: '客户从平台注册' }
})

export const { comment: TbAccountConsumerStatusComment } = TbAccountConsumerStatusDefinition
export const { comment: TbAccountConsumerPayModeComment } = TbAccountConsumerPayModeDefinition
export const { comment: TbAccountConsumerClassTypeComment } = TbAccountConsumerClassTypeDefinition
export const { comment: TbAccountConsumerStageComment } = TbAccountConsumerStageDefinition
export const { comment: TbAccountConsumerAuthStatusComment } = TbAccountConsumerAuthStatusDefinition
export const { comment: TbAccountConsumerSourceComment } = TbAccountConsumerSourceDefinition

export class TbAccountConsumerDto extends DataBaseDto {
    @ApiProperty({ description: '客户UID', example: '2149446185344106496' })
    @IsString({ message: '客户UID必须是字符串' })
    @Length(1, 19, { message: '客户UID长度不能超过19位' })
    uid: string

    @ApiProperty({ description: '归属账号UID', example: '2149446185344106496' })
    @IsString({ message: '归属账号UID必须是字符串' })
    @Length(1, 19, { message: '归属账号UID长度不能超过19位' })
    ownerUserUid: string

    @ApiProperty({ description: '客户名称', example: '测试客户' })
    @IsString({ message: '客户名称必须是字符串' })
    @IsNotEmpty({ message: '客户名称必填' })
    @MaxLength(64, { message: '客户名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '客户别名', example: 'Test Client', required: false })
    @IsOptional()
    @IsString({ message: '客户别名必须是字符串' })
    @MaxLength(64, { message: '客户别名长度不能超过64位' })
    alias: string

    @ApiProperty({ description: '财务品牌主键', example: 1 })
    @IsInt({ message: '财务品牌主键必须是整数' })
    @Min(1, { message: '财务品牌主键必须大于0' })
    brandKeyId: number

    @ApiProperty({ description: '财务币种编码', example: 'USD' })
    @IsString({ message: '财务币种编码必须是字符串' })
    @MaxLength(16, { message: '财务币种编码长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '邮箱', example: 'consumer@example.com' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @MaxLength(128, { message: '邮箱长度不能超过128位' })
    email: string

    @ApiProperty({ description: '电话号码', example: '18888888888', required: false })
    @IsOptional()
    @IsString({ message: '电话号码必须是字符串' })
    @MaxLength(32, { message: '电话号码长度不能超过32位' })
    phone: string

    @ApiProperty({ description: TbAccountConsumerStatusComment, enum: TbAccountConsumerStatus, enumName: 'TbAccountConsumerStatus' })
    @IsEnum(TbAccountConsumerStatus, { message: '客户状态格式错误' })
    status: TbAccountConsumerStatus

    @ApiProperty({ description: TbAccountConsumerPayModeComment, enum: TbAccountConsumerPayMode, enumName: 'TbAccountConsumerPayMode' })
    @IsEnum(TbAccountConsumerPayMode, { message: '付款模式格式错误' })
    payMode: TbAccountConsumerPayMode

    @ApiProperty({
        description: TbAccountConsumerClassTypeComment,
        enum: TbAccountConsumerClassType,
        enumName: 'TbAccountConsumerClassType'
    })
    @IsEnum(TbAccountConsumerClassType, { message: '客户类型格式错误' })
    classType: TbAccountConsumerClassType

    @ApiProperty({ description: '余额（放大百万倍存储）', example: 0 })
    balance: number

    @ApiProperty({ description: 'USD余额（放大百万倍存储）', example: 0 })
    balanceUsd: number

    @ApiProperty({ description: '信用额度（放大百万倍存储）', example: 0 })
    credit: number

    @ApiProperty({ description: 'USD信用额度（放大百万倍存储）', example: 0 })
    creditUsd: number

    @ApiProperty({ description: '客户等级', example: 1 })
    @IsInt({ message: '客户等级必须是整数' })
    @Min(1, { message: '客户等级不能小于1' })
    level: number

    @ApiProperty({ description: TbAccountConsumerStageComment, enum: TbAccountConsumerStage, enumName: 'TbAccountConsumerStage' })
    @IsEnum(TbAccountConsumerStage, { message: '客户阶段格式错误' })
    stage: TbAccountConsumerStage

    @ApiProperty({
        description: TbAccountConsumerAuthStatusComment,
        enum: TbAccountConsumerAuthStatus,
        enumName: 'TbAccountConsumerAuthStatus'
    })
    @IsEnum(TbAccountConsumerAuthStatus, { message: '认证状态格式错误' })
    authStatus: TbAccountConsumerAuthStatus

    @ApiProperty({ description: TbAccountConsumerSourceComment, enum: TbAccountConsumerSource, enumName: 'TbAccountConsumerSource' })
    @IsEnum(TbAccountConsumerSource, { message: '注册来源格式错误' })
    source: TbAccountConsumerSource

    @ApiProperty({ description: '备注', example: '重点客户', required: false })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('uk_tb_account_consumer_uid', ['uid'], { unique: true })
@Index('idx_tb_account_consumer_owner_user_uid', ['ownerUserUid'])
@Index('idx_tb_account_consumer_brand_key_id', ['brandKeyId'])
@Index('idx_tb_account_consumer_status', ['status'])
@Index('idx_tb_account_consumer_currency', ['currency'])
@Entity({ name: 'tb_account_consumer', comment: '外部客户账号表' })
export class TbAccountConsumer extends DataBaseAdapter {
    @Column({ name: TbAccountConsumerColumn.UID, type: 'varchar', length: 19, nullable: false, comment: '客户UID' })
    uid: string

    @Column({ name: TbAccountConsumerColumn.OWNER_USER_UID, type: 'varchar', length: 19, nullable: false, comment: '归属账号UID' })
    ownerUserUid: string

    @Column({ name: TbAccountConsumerColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '客户名称' })
    name: string

    @Column({ name: TbAccountConsumerColumn.ALIAS, type: 'varchar', length: 64, nullable: true, comment: '客户别名' })
    alias: string

    @Column({ name: TbAccountConsumerColumn.BRAND_KEY_ID, type: 'int', nullable: false, comment: '财务品牌主键' })
    brandKeyId: number

    @Column({ name: TbAccountConsumerColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '财务币种编码' })
    currency: string

    @Column({ name: TbAccountConsumerColumn.EMAIL, type: 'varchar', length: 128, nullable: false, comment: '邮箱' })
    email: string

    @Column({ name: TbAccountConsumerColumn.PHONE, type: 'varchar', length: 32, nullable: true, comment: '电话号码' })
    phone: string

    @Column({ name: TbAccountConsumerColumn.STATUS, type: 'varchar', length: 32, nullable: false, comment: TbAccountConsumerStatusComment })
    status: TbAccountConsumerStatus

    @Column({
        name: TbAccountConsumerColumn.PAY_MODE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbAccountConsumerPayModeComment
    })
    payMode: TbAccountConsumerPayMode

    @Column({
        name: TbAccountConsumerColumn.CLASS_TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbAccountConsumerClassType.COMMON,
        comment: TbAccountConsumerClassTypeComment
    })
    classType: TbAccountConsumerClassType

    @Column({ name: TbAccountConsumerColumn.BALANCE, type: 'bigint', nullable: false, default: 0, comment: '余额（放大百万倍存储）' })
    balance: number

    @Column({
        name: TbAccountConsumerColumn.BALANCE_USD,
        type: 'bigint',
        nullable: false,
        default: 0,
        comment: 'USD余额（放大百万倍存储）'
    })
    balanceUsd: number

    @Column({ name: TbAccountConsumerColumn.CREDIT, type: 'bigint', nullable: false, default: 0, comment: '信用额度（放大百万倍存储）' })
    credit: number

    @Column({
        name: TbAccountConsumerColumn.CREDIT_USD,
        type: 'bigint',
        nullable: false,
        default: 0,
        comment: 'USD信用额度（放大百万倍存储）'
    })
    creditUsd: number

    @Column({ name: TbAccountConsumerColumn.LEVEL, type: 'int', nullable: false, default: 1, comment: '客户等级' })
    level: number

    @Column({
        name: TbAccountConsumerColumn.STAGE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbAccountConsumerStage.CLUETRAIL,
        comment: TbAccountConsumerStageComment
    })
    stage: TbAccountConsumerStage

    @Column({
        name: TbAccountConsumerColumn.AUTH_STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbAccountConsumerAuthStatus.UNVERIFIED,
        comment: TbAccountConsumerAuthStatusComment
    })
    authStatus: TbAccountConsumerAuthStatus

    @Column({
        name: TbAccountConsumerColumn.SOURCE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbAccountConsumerSource.MANUAL,
        comment: TbAccountConsumerSourceComment
    })
    source: TbAccountConsumerSource

    @Column({ name: TbAccountConsumerColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
