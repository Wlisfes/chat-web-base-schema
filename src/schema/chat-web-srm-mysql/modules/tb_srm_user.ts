import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata, BigintNumberTransformer } from '@/utils'

export enum TbSrmUserColumn {
    KEY_ID = 'key_id',
    OWNER_USER_UID = 'owner_user_uid',
    NAME = 'name',
    ALIAS = 'alias',
    CURRENCY = 'currency',
    EMAIL = 'email',
    PHONE = 'phone',
    STATUS = 'status',
    PAY_MODE = 'pay_mode',
    BALANCE = 'balance',
    BALANCE_USD = 'balance_usd',
    CREDIT = 'credit',
    CREDIT_USD = 'credit_usd',
    LEVEL = 'level',
    STAGE = 'stage',
    SOURCE = 'source',
    REMARK = 'remark',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmUserStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmUserStatusDefinition = defineEnumMetadata(TbSrmUserStatus, '供应商状态', {
    [TbSrmUserStatus.DISABLE]: { label: '禁用', description: '供应商账号不可用', type: 'error' },
    [TbSrmUserStatus.ENABLE]: { label: '启用', description: '供应商账号正常使用', type: 'success' }
})

export enum TbSrmUserPayMode {
    POSTPAID = 'postpaid',
    PREPAID = 'prepaid'
}

export const TbSrmUserPayModeDefinition = defineEnumMetadata(TbSrmUserPayMode, '付款模式', {
    [TbSrmUserPayMode.POSTPAID]: { label: '后付', description: '账期后付费', type: 'orange' },
    [TbSrmUserPayMode.PREPAID]: { label: '预付', description: '账户预付费', type: 'cyan' }
})

export enum TbSrmUserStage {
    AUTHENTICATE = 'authenticate',
    CHARGE = 'charge',
    CLUETRAIL = 'cluetrail',
    COOPERATE = 'cooperate',
    INTENTION = 'intention',
    PRODUCTION = 'production',
    TESTING = 'testing'
}

export const TbSrmUserStageDefinition = defineEnumMetadata(TbSrmUserStage, '供应商阶段', {
    [TbSrmUserStage.CLUETRAIL]: { label: '线索阶段', description: '供应商处于线索跟进', type: 'default' },
    [TbSrmUserStage.INTENTION]: { label: '意向阶段', description: '供应商已有合作意向', type: 'cyan' },
    [TbSrmUserStage.AUTHENTICATE]: { label: '认证阶段', description: '供应商正在认证', type: 'blue' },
    [TbSrmUserStage.CHARGE]: { label: '充值阶段', description: '供应商准备充值', type: 'orange' },
    [TbSrmUserStage.TESTING]: { label: '测试阶段', description: '供应商正在业务测试', type: 'geekblue' },
    [TbSrmUserStage.PRODUCTION]: { label: '生产阶段', description: '供应商已进入生产', type: 'green' },
    [TbSrmUserStage.COOPERATE]: { label: '价值阶段', description: '供应商已形成稳定价值', type: 'purple' }
})

export class TbSrmUserDto extends DataBaseDto {
    @ApiProperty({ description: '归属账号UID', example: '2149446185344106496' })
    @IsString({ message: '归属账号UID必须是字符串' })
    @Length(1, 19, { message: '归属账号UID长度不能超过19位' })
    ownerUserUid: string

    @ApiProperty({ description: '供应商名称', example: '测试供应商' })
    @IsString({ message: '供应商名称必须是字符串' })
    @IsNotEmpty({ message: '供应商名称必填' })
    @MaxLength(64, { message: '供应商名称长度不能超过64位' })
    name: string

    @ApiProperty({
        description: '供应商别名：SSK + 创建人工号 + 4位数字或大写字母随机码，全表唯一',
        example: 'SSK1233A7K9',
        required: false
    })
    @IsOptional()
    @IsString({ message: '供应商别名必须是字符串' })
    @MaxLength(64, { message: '供应商别名长度不能超过64位' })
    alias: string

    @ApiProperty({ description: '财务币种编码', example: 'USD' })
    @IsString({ message: '财务币种编码必须是字符串' })
    @MaxLength(16, { message: '财务币种编码长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '邮箱', example: 'supplier@example.com' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @MaxLength(128, { message: '邮箱长度不能超过128位' })
    email: string

    @ApiProperty({ description: '电话号码', example: '18888888888', required: false })
    @IsOptional()
    @IsString({ message: '电话号码必须是字符串' })
    @MaxLength(32, { message: '电话号码长度不能超过32位' })
    phone: string

    @ApiProperty({ description: TbSrmUserStatusDefinition.comment, enum: TbSrmUserStatus, enumName: 'TbSrmUserStatus' })
    @IsEnum(TbSrmUserStatus, { message: '供应商状态格式错误' })
    status: TbSrmUserStatus

    @ApiProperty({ description: TbSrmUserPayModeDefinition.comment, enum: TbSrmUserPayMode, enumName: 'TbSrmUserPayMode' })
    @IsEnum(TbSrmUserPayMode, { message: '付款模式格式错误' })
    payMode: TbSrmUserPayMode

    @ApiProperty({ description: '余额（放大百万倍存储）', example: 0 })
    balance: number

    @ApiProperty({ description: 'USD余额（放大百万倍存储）', example: 0 })
    balanceUsd: number

    @ApiProperty({ description: '信用额度（放大百万倍存储）', example: 0 })
    credit: number

    @ApiProperty({ description: 'USD信用额度（放大百万倍存储）', example: 0 })
    creditUsd: number

    @ApiProperty({ description: '供应商等级', example: 1 })
    @Type(() => Number)
    @IsInt({ message: '供应商等级必须是整数' })
    @Min(1, { message: '供应商等级不能小于1' })
    level: number

    @ApiProperty({ description: TbSrmUserStageDefinition.comment, enum: TbSrmUserStage, enumName: 'TbSrmUserStage' })
    @IsEnum(TbSrmUserStage, { message: '供应商阶段格式错误' })
    stage: TbSrmUserStage

    @ApiProperty({ description: '注册来源：Skyline 枚举 CHUNK_SRM_USER_SOURCE 的枚举项主键', example: 1024258 })
    @Type(() => Number)
    @IsInt({ message: '注册来源必须是整数' })
    @Min(1, { message: '注册来源必须大于0' })
    source: number

    @ApiProperty({ description: '备注', example: '重点供应商', required: false })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('uk_tb_srm_user_alias', ['alias'], { unique: true })
@Index('idx_tb_srm_user_owner_user_uid', ['ownerUserUid'])
@Index('idx_tb_srm_user_status', ['status'])
@Index('idx_tb_srm_user_currency', ['currency'])
@Entity({ name: 'tb_srm_user', comment: '供应商账号表' })
export class TbSrmUser extends DataBaseAdapter {
    @Column({ name: TbSrmUserColumn.OWNER_USER_UID, type: 'varchar', length: 19, nullable: false, comment: '归属账号UID' })
    ownerUserUid: string

    @Column({ name: TbSrmUserColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '供应商名称' })
    name: string

    @Column({
        name: TbSrmUserColumn.ALIAS,
        type: 'varchar',
        length: 64,
        nullable: true,
        comment: '供应商别名：SSK + 创建人工号 + 4位数字或大写字母随机码，全表唯一'
    })
    alias: string

    @Column({ name: TbSrmUserColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '财务币种编码' })
    currency: string

    @Column({ name: TbSrmUserColumn.EMAIL, type: 'varchar', length: 128, nullable: false, comment: '邮箱' })
    email: string

    @Column({ name: TbSrmUserColumn.PHONE, type: 'varchar', length: 32, nullable: true, comment: '电话号码' })
    phone: string

    @Column({
        name: TbSrmUserColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSrmUserStatusDefinition.comment
    })
    status: TbSrmUserStatus

    @Column({
        name: TbSrmUserColumn.PAY_MODE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSrmUserPayModeDefinition.comment
    })
    payMode: TbSrmUserPayMode

    @Column({
        name: TbSrmUserColumn.BALANCE,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '余额（放大百万倍存储）'
    })
    balance: number

    @Column({
        name: TbSrmUserColumn.BALANCE_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: 'USD余额（放大百万倍存储）'
    })
    balanceUsd: number

    @Column({
        name: TbSrmUserColumn.CREDIT,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '信用额度（放大百万倍存储）'
    })
    credit: number

    @Column({
        name: TbSrmUserColumn.CREDIT_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: 'USD信用额度（放大百万倍存储）'
    })
    creditUsd: number

    @Column({ name: TbSrmUserColumn.LEVEL, type: 'int', nullable: false, default: 1, comment: '供应商等级' })
    level: number

    @Column({
        name: TbSrmUserColumn.STAGE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmUserStage.CLUETRAIL,
        comment: TbSrmUserStageDefinition.comment
    })
    stage: TbSrmUserStage

    @Column({
        name: TbSrmUserColumn.SOURCE,
        type: 'int',
        nullable: false,
        comment: '注册来源：Skyline 枚举 CHUNK_SRM_USER_SOURCE 的枚举项主键'
    })
    source: number

    @Column({ name: TbSrmUserColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
