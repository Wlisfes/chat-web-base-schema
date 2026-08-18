import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

export enum TbFinanceClientColumn {
    KEY_ID = 'key_id',
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

export enum TbFinanceClientStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbFinanceClientStatusDefinition = defineEnumMetadata(TbFinanceClientStatus, '客户状态', {
    [TbFinanceClientStatus.DISABLE]: { label: '禁用', description: '客户账号不可用' },
    [TbFinanceClientStatus.ENABLE]: { label: '启用', description: '客户账号正常使用' }
})

export enum TbFinanceClientPayMode {
    POSTPAID = 'postpaid',
    PREPAID = 'prepaid'
}

export const TbFinanceClientPayModeDefinition = defineEnumMetadata(TbFinanceClientPayMode, '付款模式', {
    [TbFinanceClientPayMode.POSTPAID]: { label: '后付', description: '账期后付费' },
    [TbFinanceClientPayMode.PREPAID]: { label: '预付', description: '账户预付费' }
})

export enum TbFinanceClientClassType {
    COMMON = 'common',
    COOPERATE = 'cooperate'
}

export const TbFinanceClientClassTypeDefinition = defineEnumMetadata(TbFinanceClientClassType, '客户类型', {
    [TbFinanceClientClassType.COMMON]: { label: '普通客户', description: '普通业务客户' },
    [TbFinanceClientClassType.COOPERATE]: { label: '推广客户', description: '合作推广客户' }
})

export enum TbFinanceClientStage {
    AUTHENTICATE = 'authenticate',
    CHARGE = 'charge',
    CLUETRAIL = 'cluetrail',
    COOPERATE = 'cooperate',
    INTENTION = 'intention',
    PRODUCTION = 'production',
    TESTING = 'testing'
}

export const TbFinanceClientStageDefinition = defineEnumMetadata(TbFinanceClientStage, '客户阶段', {
    [TbFinanceClientStage.AUTHENTICATE]: { label: '认证阶段', description: '客户正在认证' },
    [TbFinanceClientStage.CHARGE]: { label: '充值阶段', description: '客户准备充值' },
    [TbFinanceClientStage.CLUETRAIL]: { label: '线索阶段', description: '客户处于线索跟进' },
    [TbFinanceClientStage.COOPERATE]: { label: '价值阶段', description: '客户已形成稳定价值' },
    [TbFinanceClientStage.INTENTION]: { label: '意向阶段', description: '客户已有合作意向' },
    [TbFinanceClientStage.PRODUCTION]: { label: '生产阶段', description: '客户已进入生产' },
    [TbFinanceClientStage.TESTING]: { label: '测试阶段', description: '客户正在业务测试' }
})

export enum TbFinanceClientAuthStatus {
    PENDING = 'pending',
    REJECTED = 'rejected',
    UNVERIFIED = 'unverified',
    VERIFIED = 'verified'
}

export const TbFinanceClientAuthStatusDefinition = defineEnumMetadata(TbFinanceClientAuthStatus, '认证状态', {
    [TbFinanceClientAuthStatus.PENDING]: { label: '认证中', description: '认证资料审核中' },
    [TbFinanceClientAuthStatus.REJECTED]: { label: '认证失败', description: '认证资料未通过' },
    [TbFinanceClientAuthStatus.UNVERIFIED]: { label: '未认证', description: '尚未提交认证' },
    [TbFinanceClientAuthStatus.VERIFIED]: { label: '已认证', description: '认证已通过' }
})

export enum TbFinanceClientSource {
    MANUAL = 'manual',
    PLATFORM = 'platform'
}

export const TbFinanceClientSourceDefinition = defineEnumMetadata(TbFinanceClientSource, '注册来源', {
    [TbFinanceClientSource.MANUAL]: { label: '手动创建', description: '管理端人工创建' },
    [TbFinanceClientSource.PLATFORM]: { label: '平台注册', description: '客户从平台注册' }
})

export const { comment: TbFinanceClientStatusComment } = TbFinanceClientStatusDefinition
export const { comment: TbFinanceClientPayModeComment } = TbFinanceClientPayModeDefinition
export const { comment: TbFinanceClientClassTypeComment } = TbFinanceClientClassTypeDefinition
export const { comment: TbFinanceClientStageComment } = TbFinanceClientStageDefinition
export const { comment: TbFinanceClientAuthStatusComment } = TbFinanceClientAuthStatusDefinition
export const { comment: TbFinanceClientSourceComment } = TbFinanceClientSourceDefinition

export class TbFinanceClientDto extends DataBaseDto {
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

    @ApiProperty({ description: '归属品牌主键', example: 1 })
    @IsInt({ message: '归属品牌主键必须是整数' })
    @Min(1, { message: '归属品牌主键必须大于0' })
    brandKeyId: number

    @ApiProperty({ description: '币种编码', example: 'USD' })
    @IsString({ message: '币种编码必须是字符串' })
    @MaxLength(16, { message: '币种编码长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '邮箱', example: 'client@example.com' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @MaxLength(128, { message: '邮箱长度不能超过128位' })
    email: string

    @ApiProperty({ description: '电话号码', example: '18888888888', required: false })
    @IsOptional()
    @IsString({ message: '电话号码必须是字符串' })
    @MaxLength(32, { message: '电话号码长度不能超过32位' })
    phone: string

    @ApiProperty({ description: TbFinanceClientStatusComment, enum: TbFinanceClientStatus, enumName: 'TbFinanceClientStatus' })
    @IsEnum(TbFinanceClientStatus, { message: '客户状态格式错误' })
    status: TbFinanceClientStatus

    @ApiProperty({ description: TbFinanceClientPayModeComment, enum: TbFinanceClientPayMode, enumName: 'TbFinanceClientPayMode' })
    @IsEnum(TbFinanceClientPayMode, { message: '付款模式格式错误' })
    payMode: TbFinanceClientPayMode

    @ApiProperty({ description: TbFinanceClientClassTypeComment, enum: TbFinanceClientClassType, enumName: 'TbFinanceClientClassType' })
    @IsEnum(TbFinanceClientClassType, { message: '客户类型格式错误' })
    classType: TbFinanceClientClassType

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

    @ApiProperty({ description: TbFinanceClientStageComment, enum: TbFinanceClientStage, enumName: 'TbFinanceClientStage' })
    @IsEnum(TbFinanceClientStage, { message: '客户阶段格式错误' })
    stage: TbFinanceClientStage

    @ApiProperty({
        description: TbFinanceClientAuthStatusComment,
        enum: TbFinanceClientAuthStatus,
        enumName: 'TbFinanceClientAuthStatus'
    })
    @IsEnum(TbFinanceClientAuthStatus, { message: '认证状态格式错误' })
    authStatus: TbFinanceClientAuthStatus

    @ApiProperty({ description: TbFinanceClientSourceComment, enum: TbFinanceClientSource, enumName: 'TbFinanceClientSource' })
    @IsEnum(TbFinanceClientSource, { message: '注册来源格式错误' })
    source: TbFinanceClientSource

    @ApiProperty({ description: '备注', example: '重点客户', required: false })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('idx_tb_finance_client_owner_user_uid', ['ownerUserUid'])
@Index('idx_tb_finance_client_brand_key_id', ['brandKeyId'])
@Index('idx_tb_finance_client_status', ['status'])
@Index('idx_tb_finance_client_currency', ['currency'])
@Entity({ name: 'tb_finance_client', comment: '财务消费客户表' })
export class TbFinanceClient extends DataBaseAdapter {
    @Column({ name: TbFinanceClientColumn.OWNER_USER_UID, type: 'varchar', length: 19, nullable: false, comment: '归属账号UID' })
    ownerUserUid: string

    @Column({ name: TbFinanceClientColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '客户名称' })
    name: string

    @Column({ name: TbFinanceClientColumn.ALIAS, type: 'varchar', length: 64, nullable: true, comment: '客户别名' })
    alias: string

    @Column({ name: TbFinanceClientColumn.BRAND_KEY_ID, type: 'int', nullable: false, comment: '归属品牌主键' })
    brandKeyId: number

    @Column({ name: TbFinanceClientColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '币种编码' })
    currency: string

    @Column({ name: TbFinanceClientColumn.EMAIL, type: 'varchar', length: 128, nullable: false, comment: '邮箱' })
    email: string

    @Column({ name: TbFinanceClientColumn.PHONE, type: 'varchar', length: 32, nullable: true, comment: '电话号码' })
    phone: string

    @Column({ name: TbFinanceClientColumn.STATUS, type: 'varchar', length: 32, nullable: false, comment: TbFinanceClientStatusComment })
    status: TbFinanceClientStatus

    @Column({ name: TbFinanceClientColumn.PAY_MODE, type: 'varchar', length: 32, nullable: false, comment: TbFinanceClientPayModeComment })
    payMode: TbFinanceClientPayMode

    @Column({
        name: TbFinanceClientColumn.CLASS_TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbFinanceClientClassType.COMMON,
        comment: TbFinanceClientClassTypeComment
    })
    classType: TbFinanceClientClassType

    @Column({ name: TbFinanceClientColumn.BALANCE, type: 'bigint', nullable: false, default: 0, comment: '余额（放大百万倍存储）' })
    balance: number

    @Column({ name: TbFinanceClientColumn.BALANCE_USD, type: 'bigint', nullable: false, default: 0, comment: 'USD余额（放大百万倍存储）' })
    balanceUsd: number

    @Column({ name: TbFinanceClientColumn.CREDIT, type: 'bigint', nullable: false, default: 0, comment: '信用额度（放大百万倍存储）' })
    credit: number

    @Column({
        name: TbFinanceClientColumn.CREDIT_USD,
        type: 'bigint',
        nullable: false,
        default: 0,
        comment: 'USD信用额度（放大百万倍存储）'
    })
    creditUsd: number

    @Column({ name: TbFinanceClientColumn.LEVEL, type: 'int', nullable: false, default: 1, comment: '客户等级' })
    level: number

    @Column({
        name: TbFinanceClientColumn.STAGE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbFinanceClientStage.CLUETRAIL,
        comment: TbFinanceClientStageComment
    })
    stage: TbFinanceClientStage

    @Column({
        name: TbFinanceClientColumn.AUTH_STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbFinanceClientAuthStatus.UNVERIFIED,
        comment: TbFinanceClientAuthStatusComment
    })
    authStatus: TbFinanceClientAuthStatus

    @Column({
        name: TbFinanceClientColumn.SOURCE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbFinanceClientSource.MANUAL,
        comment: TbFinanceClientSourceComment
    })
    source: TbFinanceClientSource

    @Column({ name: TbFinanceClientColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
