import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbSmsAppColumn {
    KEY_ID = 'key_id',
    USER_KEY_ID = 'user_key_id',
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

export enum TbSmsAppStatus {
    ACTIVE = 'active',
    DISABLE = 'disable',
    INACTIVE = 'inactive'
}

export const TbSmsAppStatusDefinition = defineEnumMetadata(TbSmsAppStatus, '短信应用状态', {
    [TbSmsAppStatus.ACTIVE]: { label: '已激活', description: '应用可正常发送短信', type: 'success' },
    [TbSmsAppStatus.DISABLE]: { label: '禁用', description: '应用已停止使用', type: 'error' },
    [TbSmsAppStatus.INACTIVE]: { label: '未激活', description: '应用尚未启用', type: 'warning' }
})

/** 短信应用类型：枚举值与应用别名中的4位类型标识保持一致。 */
export enum TbSmsAppType {
    MRKT = 'MRKT',
    NTFY = 'NTFY',
    SOTP = 'SOTP'
}

export const TbSmsAppTypeDefinition = defineEnumMetadata(TbSmsAppType, '短信应用类型', {
    [TbSmsAppType.MRKT]: { label: '营销短信', description: '用于营销推广内容', type: 'orange' },
    [TbSmsAppType.NTFY]: { label: '通知短信', description: '用于业务通知内容', type: 'info' },
    [TbSmsAppType.SOTP]: { label: '验证码', description: '用于一次性验证码', type: 'success' }
})

export class TbSmsAppDto extends DataBaseByDto {
    @ApiProperty({ description: 'CRM 客户主键', example: 10241000 })
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '应用ID，固定16位字母数字', example: 'V0o57nDC6fqg01wV' })
    @IsString({ message: '应用ID必须是字符串' })
    @IsNotEmpty({ message: '应用ID必填' })
    @MaxLength(16, { message: '应用ID长度不能超过16位' })
    appId: string

    @ApiProperty({
        description: '应用密钥（AES-256-GCM 加密存储）',
        required: false,
        writeOnly: true,
        example: '0123456789abcdef0123456789abcdef'
    })
    @IsOptional()
    @IsString({ message: '应用密钥必须是字符串' })
    @MaxLength(255, { message: '应用密钥长度不能超过255位' })
    secret: string

    @ApiProperty({ description: '应用名称', example: '登录验证码' })
    @IsString({ message: '应用名称必须是字符串' })
    @IsNotEmpty({ message: '应用名称必填' })
    @MaxLength(64, { message: '应用名称长度不能超过64位' })
    appName: string

    @ApiProperty({ description: '应用别名', example: 'CSK1233SOTPA001' })
    @IsString({ message: '应用别名必须是字符串' })
    @IsNotEmpty({ message: '应用别名必填' })
    @MaxLength(64, { message: '应用别名长度不能超过64位' })
    appAlias: string

    @ApiProperty({
        description: TbSmsAppStatusDefinition.comment,
        enum: TbSmsAppStatus,
        enumName: 'TbSmsAppStatus'
    })
    @IsEnum(TbSmsAppStatus, { message: '短信应用状态格式错误' })
    status: TbSmsAppStatus

    @ApiProperty({
        description: TbSmsAppTypeDefinition.comment,
        enum: TbSmsAppType,
        enumName: 'TbSmsAppType'
    })
    @IsEnum(TbSmsAppType, { message: '短信应用类型格式错误' })
    type: TbSmsAppType

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

@Index('uk_tb_sms_app_app_id', ['appId'], { unique: true })
@Index('uk_tb_sms_app_user_alias', ['userKeyId', 'appAlias'], { unique: true })
@Index('idx_tb_sms_app_user_key_id', ['userKeyId'])
@Index('idx_tb_sms_app_status', ['status'])
@Entity({ name: 'tb_sms_app', comment: 'SMS 客户短信应用表' })
export class TbSmsApp extends DataBaseByAdapter {
    @Column({ name: TbSmsAppColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'CRM 客户主键' })
    userKeyId: number

    @Column({ name: TbSmsAppColumn.APP_ID, type: 'varchar', length: 16, nullable: false, comment: '应用ID' })
    appId: string

    @Column({
        name: TbSmsAppColumn.SECRET,
        type: 'varchar',
        length: 255,
        nullable: true,
        select: false,
        comment: '应用密钥（AES-256-GCM 加密存储）'
    })
    secret: string

    @Column({ name: TbSmsAppColumn.APP_NAME, type: 'varchar', length: 64, nullable: false, comment: '应用名称' })
    appName: string

    @Column({ name: TbSmsAppColumn.APP_ALIAS, type: 'varchar', length: 64, nullable: false, comment: '应用别名' })
    appAlias: string

    @Column({
        name: TbSmsAppColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSmsAppStatusDefinition.comment
    })
    status: TbSmsAppStatus

    @Column({
        name: TbSmsAppColumn.TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSmsAppTypeDefinition.comment
    })
    type: TbSmsAppType

    @Column({ name: TbSmsAppColumn.PUSH_URL, type: 'varchar', length: 1024, nullable: true, comment: '报告推送地址' })
    pushUrl: string

    @Column({ name: TbSmsAppColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
