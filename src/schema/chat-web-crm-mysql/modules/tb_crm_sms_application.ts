import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbCrmSmsApplicationColumn {
    KEY_ID = 'key_id',
    CONSUMER_KEY_ID = 'consumer_key_id',
    OWNER_USER_UID = 'owner_user_uid',
    APP_ID = 'app_id',
    SECRET = 'secret',
    APP_NAME = 'app_name',
    APP_ALIAS = 'app_alias',
    STATUS = 'status',
    TYPE = 'type',
    PUSH_URL = 'push_url',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbCrmSmsApplicationStatus {
    ACTIVE = 'active',
    DISABLE = 'disable',
    INACTIVE = 'inactive'
}

export const TbCrmSmsApplicationStatusDefinition = defineEnumMetadata(TbCrmSmsApplicationStatus, '短信应用状态', {
    [TbCrmSmsApplicationStatus.ACTIVE]: { label: '已激活', description: '应用可正常发送短信' },
    [TbCrmSmsApplicationStatus.DISABLE]: { label: '禁用', description: '应用已停止使用' },
    [TbCrmSmsApplicationStatus.INACTIVE]: { label: '未激活', description: '应用尚未启用' }
})

export enum TbCrmSmsApplicationType {
    MARKET = 'market',
    NOTIFY = 'notify',
    OTP = 'otp'
}

export const TbCrmSmsApplicationTypeDefinition = defineEnumMetadata(TbCrmSmsApplicationType, '短信应用类型', {
    [TbCrmSmsApplicationType.MARKET]: { label: '营销短信', description: '用于营销推广内容' },
    [TbCrmSmsApplicationType.NOTIFY]: { label: '通知短信', description: '用于业务通知内容' },
    [TbCrmSmsApplicationType.OTP]: { label: '验证码', description: '用于一次性验证码' }
})

export const { comment: TbCrmSmsApplicationStatusComment } = TbCrmSmsApplicationStatusDefinition
export const { comment: TbCrmSmsApplicationTypeComment } = TbCrmSmsApplicationTypeDefinition

export class TbCrmSmsApplicationDto extends DataBaseByDto {
    @ApiProperty({ description: 'Account 客户主键', example: 5181000 })
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    consumerKeyId: number

    @ApiProperty({ description: '归属账号UID', example: '2149446185344106496' })
    @IsString({ message: '归属账号UID必须是字符串' })
    @Length(1, 19, { message: '归属账号UID长度不能超过19位' })
    ownerUserUid: string

    @ApiProperty({ description: '应用ID', example: 'SMS9F2A8B31' })
    @IsString({ message: '应用ID必须是字符串' })
    @IsNotEmpty({ message: '应用ID必填' })
    @MaxLength(32, { message: '应用ID长度不能超过32位' })
    appId: string

    @ApiProperty({ description: '应用密钥', required: false, writeOnly: true, example: '0123456789abcdef0123456789abcdef' })
    @IsOptional()
    @IsString({ message: '应用密钥必须是字符串' })
    @MaxLength(128, { message: '应用密钥长度不能超过128位' })
    secret: string

    @ApiProperty({ description: '应用名称', example: '登录验证码' })
    @IsString({ message: '应用名称必须是字符串' })
    @IsNotEmpty({ message: '应用名称必填' })
    @MaxLength(64, { message: '应用名称长度不能超过64位' })
    appName: string

    @ApiProperty({ description: '应用别名', example: 'LYNKS-OTP' })
    @IsString({ message: '应用别名必须是字符串' })
    @IsNotEmpty({ message: '应用别名必填' })
    @MaxLength(64, { message: '应用别名长度不能超过64位' })
    appAlias: string

    @ApiProperty({
        description: TbCrmSmsApplicationStatusComment,
        enum: TbCrmSmsApplicationStatus,
        enumName: 'TbCrmSmsApplicationStatus'
    })
    @IsEnum(TbCrmSmsApplicationStatus, { message: '短信应用状态格式错误' })
    status: TbCrmSmsApplicationStatus

    @ApiProperty({ description: TbCrmSmsApplicationTypeComment, enum: TbCrmSmsApplicationType, enumName: 'TbCrmSmsApplicationType' })
    @IsEnum(TbCrmSmsApplicationType, { message: '短信应用类型格式错误' })
    type: TbCrmSmsApplicationType

    @ApiProperty({ description: '报告推送地址', required: false, example: 'https://example.com/sms/report' })
    @IsOptional()
    @IsString({ message: '报告推送地址必须是字符串' })
    @MaxLength(1024, { message: '报告推送地址长度不能超过1024位' })
    pushUrl: string

    @ApiProperty({ description: '备注', required: false, example: '客户验证码应用' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('uk_tb_crm_sms_application_app_id', ['appId'], { unique: true })
@Index('uk_tb_crm_sms_application_consumer_alias', ['consumerKeyId', 'appAlias'], { unique: true })
@Index('idx_tb_crm_sms_application_consumer_key_id', ['consumerKeyId'])
@Index('idx_tb_crm_sms_application_owner_user_uid', ['ownerUserUid'])
@Index('idx_tb_crm_sms_application_status', ['status'])
@Entity({ name: 'tb_crm_sms_application', comment: 'CRM 客户短信应用表' })
export class TbCrmSmsApplication extends DataBaseByAdapter {
    @Column({ name: TbCrmSmsApplicationColumn.CONSUMER_KEY_ID, type: 'int', nullable: false, comment: 'Account 客户主键' })
    consumerKeyId: number

    @Column({ name: TbCrmSmsApplicationColumn.OWNER_USER_UID, type: 'varchar', length: 19, nullable: false, comment: '归属账号UID' })
    ownerUserUid: string

    @Column({ name: TbCrmSmsApplicationColumn.APP_ID, type: 'varchar', length: 32, nullable: false, comment: '应用ID' })
    appId: string

    @Column({ name: TbCrmSmsApplicationColumn.SECRET, type: 'varchar', length: 128, nullable: true, select: false, comment: '应用密钥' })
    secret: string

    @Column({ name: TbCrmSmsApplicationColumn.APP_NAME, type: 'varchar', length: 64, nullable: false, comment: '应用名称' })
    appName: string

    @Column({ name: TbCrmSmsApplicationColumn.APP_ALIAS, type: 'varchar', length: 64, nullable: false, comment: '应用别名' })
    appAlias: string

    @Column({
        name: TbCrmSmsApplicationColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbCrmSmsApplicationStatusComment
    })
    status: TbCrmSmsApplicationStatus

    @Column({
        name: TbCrmSmsApplicationColumn.TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbCrmSmsApplicationTypeComment
    })
    type: TbCrmSmsApplicationType

    @Column({ name: TbCrmSmsApplicationColumn.PUSH_URL, type: 'varchar', length: 1024, nullable: true, comment: '报告推送地址' })
    pushUrl: string

    @Column({ name: TbCrmSmsApplicationColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
