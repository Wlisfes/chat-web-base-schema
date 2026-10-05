import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata, BigintNumberTransformer } from '@/utils'

export enum TbCrmUserColumn {
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

export enum TbCrmUserStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbCrmUserStatusDefinition = defineEnumMetadata(TbCrmUserStatus, '客户状态', {
    [TbCrmUserStatus.DISABLE]: { label: '禁用', description: '客户账号不可用', type: 'error' },
    [TbCrmUserStatus.ENABLE]: { label: '启用', description: '客户账号正常使用', type: 'success' }
})

export enum TbCrmUserPayMode {
    POSTPAID = 'postpaid',
    PREPAID = 'prepaid'
}

export const TbCrmUserPayModeDefinition = defineEnumMetadata(TbCrmUserPayMode, '付款模式', {
    [TbCrmUserPayMode.POSTPAID]: { label: '后付', description: '账期后付费', type: 'orange' },
    [TbCrmUserPayMode.PREPAID]: { label: '预付', description: '账户预付费', type: 'cyan' }
})

export enum TbCrmUserClassType {
    COMMON = 'common',
    COOPERATE = 'cooperate'
}

export const TbCrmUserClassTypeDefinition = defineEnumMetadata(TbCrmUserClassType, '客户类型', {
    [TbCrmUserClassType.COMMON]: { label: '普通客户', description: '普通业务客户', type: 'blue' },
    [TbCrmUserClassType.COOPERATE]: { label: '推广客户', description: '合作推广客户', type: 'purple' }
})

export enum TbCrmUserStage {
    AUTHENTICATE = 'authenticate',
    CHARGE = 'charge',
    CLUETRAIL = 'cluetrail',
    COOPERATE = 'cooperate',
    INTENTION = 'intention',
    PRODUCTION = 'production',
    TESTING = 'testing'
}

export const TbCrmUserStageDefinition = defineEnumMetadata(TbCrmUserStage, '客户阶段', {
    [TbCrmUserStage.AUTHENTICATE]: { label: '认证阶段', description: '客户正在认证', type: 'blue' },
    [TbCrmUserStage.CHARGE]: { label: '充值阶段', description: '客户准备充值', type: 'orange' },
    [TbCrmUserStage.CLUETRAIL]: { label: '线索阶段', description: '客户处于线索跟进', type: 'default' },
    [TbCrmUserStage.COOPERATE]: { label: '价值阶段', description: '客户已形成稳定价值', type: 'purple' },
    [TbCrmUserStage.INTENTION]: { label: '意向阶段', description: '客户已有合作意向', type: 'cyan' },
    [TbCrmUserStage.PRODUCTION]: { label: '生产阶段', description: '客户已进入生产', type: 'green' },
    [TbCrmUserStage.TESTING]: { label: '测试阶段', description: '客户正在业务测试', type: 'geekblue' }
})

export enum TbCrmUserAuthStatus {
    PENDING = 'pending',
    REJECTED = 'rejected',
    UNVERIFIED = 'unverified',
    VERIFIED = 'verified'
}

export const TbCrmUserAuthStatusDefinition = defineEnumMetadata(TbCrmUserAuthStatus, '认证状态', {
    [TbCrmUserAuthStatus.PENDING]: { label: '认证中', description: '认证资料审核中', type: 'warning' },
    [TbCrmUserAuthStatus.REJECTED]: { label: '认证失败', description: '认证资料未通过', type: 'error' },
    [TbCrmUserAuthStatus.UNVERIFIED]: { label: '未认证', description: '尚未提交认证', type: 'default' },
    [TbCrmUserAuthStatus.VERIFIED]: { label: '已认证', description: '认证已通过', type: 'success' }
})

export class TbCrmUserDto extends DataBaseDto {
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

    @ApiProperty({ description: TbCrmUserStatusDefinition.comment, enum: TbCrmUserStatus, enumName: 'TbCrmUserStatus' })
    @IsEnum(TbCrmUserStatus, { message: '客户状态格式错误' })
    status: TbCrmUserStatus

    @ApiProperty({ description: TbCrmUserPayModeDefinition.comment, enum: TbCrmUserPayMode, enumName: 'TbCrmUserPayMode' })
    @IsEnum(TbCrmUserPayMode, { message: '付款模式格式错误' })
    payMode: TbCrmUserPayMode

    @ApiProperty({
        description: TbCrmUserClassTypeDefinition.comment,
        enum: TbCrmUserClassType,
        enumName: 'TbCrmUserClassType'
    })
    @IsEnum(TbCrmUserClassType, { message: '客户类型格式错误' })
    classType: TbCrmUserClassType

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

    @ApiProperty({ description: TbCrmUserStageDefinition.comment, enum: TbCrmUserStage, enumName: 'TbCrmUserStage' })
    @IsEnum(TbCrmUserStage, { message: '客户阶段格式错误' })
    stage: TbCrmUserStage

    @ApiProperty({
        description: TbCrmUserAuthStatusDefinition.comment,
        enum: TbCrmUserAuthStatus,
        enumName: 'TbCrmUserAuthStatus'
    })
    @IsEnum(TbCrmUserAuthStatus, { message: '认证状态格式错误' })
    authStatus: TbCrmUserAuthStatus

    @ApiProperty({ description: '注册来源：Skyline 枚举 CHUNK_CRM_CRM_USER_SOURCE 的枚举项主键', example: 1024186 })
    @IsInt({ message: '注册来源必须是整数' })
    @Min(1, { message: '注册来源必须大于0' })
    source: number

    @ApiProperty({ description: '备注', example: '重点客户', required: false })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('uk_tb_crm_user_uid', ['uid'], { unique: true })
@Index('idx_tb_crm_user_owner_user_uid', ['ownerUserUid'])
@Index('idx_tb_crm_user_brand_key_id', ['brandKeyId'])
@Index('idx_tb_crm_user_status', ['status'])
@Index('idx_tb_crm_user_currency', ['currency'])
@Entity({ name: 'tb_crm_user', comment: '外部客户账号表' })
export class TbCrmUser extends DataBaseAdapter {
    @Column({ name: TbCrmUserColumn.UID, type: 'varchar', length: 19, nullable: false, comment: '客户UID' })
    uid: string

    @Column({ name: TbCrmUserColumn.OWNER_USER_UID, type: 'varchar', length: 19, nullable: false, comment: '归属账号UID' })
    ownerUserUid: string

    @Column({ name: TbCrmUserColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '客户名称' })
    name: string

    @Column({ name: TbCrmUserColumn.ALIAS, type: 'varchar', length: 64, nullable: true, comment: '客户别名' })
    alias: string

    @Column({ name: TbCrmUserColumn.BRAND_KEY_ID, type: 'int', nullable: false, comment: '财务品牌主键' })
    brandKeyId: number

    @Column({ name: TbCrmUserColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '财务币种编码' })
    currency: string

    @Column({ name: TbCrmUserColumn.EMAIL, type: 'varchar', length: 128, nullable: false, comment: '邮箱' })
    email: string

    @Column({ name: TbCrmUserColumn.PHONE, type: 'varchar', length: 32, nullable: true, comment: '电话号码' })
    phone: string

    @Column({
        name: TbCrmUserColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbCrmUserStatusDefinition.comment
    })
    status: TbCrmUserStatus

    @Column({
        name: TbCrmUserColumn.PAY_MODE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbCrmUserPayModeDefinition.comment
    })
    payMode: TbCrmUserPayMode

    @Column({
        name: TbCrmUserColumn.CLASS_TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbCrmUserClassType.COMMON,
        comment: TbCrmUserClassTypeDefinition.comment
    })
    classType: TbCrmUserClassType

    @Column({
        name: TbCrmUserColumn.BALANCE,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '余额（放大百万倍存储）'
    })
    balance: number

    @Column({
        name: TbCrmUserColumn.BALANCE_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: 'USD余额（放大百万倍存储）'
    })
    balanceUsd: number

    @Column({
        name: TbCrmUserColumn.CREDIT,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '信用额度（放大百万倍存储）'
    })
    credit: number

    @Column({
        name: TbCrmUserColumn.CREDIT_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: 'USD信用额度（放大百万倍存储）'
    })
    creditUsd: number

    @Column({ name: TbCrmUserColumn.LEVEL, type: 'int', nullable: false, default: 1, comment: '客户等级' })
    level: number

    @Column({
        name: TbCrmUserColumn.STAGE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbCrmUserStage.CLUETRAIL,
        comment: TbCrmUserStageDefinition.comment
    })
    stage: TbCrmUserStage

    @Column({
        name: TbCrmUserColumn.AUTH_STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbCrmUserAuthStatus.UNVERIFIED,
        comment: TbCrmUserAuthStatusDefinition.comment
    })
    authStatus: TbCrmUserAuthStatus

    @Column({
        name: TbCrmUserColumn.SOURCE,
        type: 'int',
        nullable: false,
        comment: '注册来源：Skyline 枚举 CHUNK_CRM_CRM_USER_SOURCE 的枚举项主键'
    })
    source: number

    @Column({ name: TbCrmUserColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
