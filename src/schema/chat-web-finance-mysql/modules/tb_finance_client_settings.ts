import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsInt, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

export enum TbFinanceClientSettingsColumn {
    KEY_ID = 'key_id',
    CLIENT_KEY_ID = 'client_key_id',
    SMS_ACTIVE = 'sms_active',
    SMS_MAX = 'sms_max',
    MAIL_ACTIVE = 'mail_active',
    MAIL_MAX = 'mail_max',
    SOCIAL_ACTIVE = 'social_active',
    SOCIAL_MAX = 'social_max',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export class TbFinanceClientSettingsDto extends DataBaseDto {
    @ApiProperty({ description: '客户主键', example: 1 })
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    clientKeyId: number

    @ApiProperty({ description: '短信业务是否激活', example: false })
    @IsBoolean({ message: '短信激活标记必须是布尔值' })
    smsActive: boolean

    @ApiProperty({ description: '短信应用最大数量', example: 1 })
    @IsInt({ message: '短信应用最大数量必须是整数' })
    @Min(0, { message: '短信应用最大数量不能小于0' })
    smsMax: number

    @ApiProperty({ description: '邮件业务是否激活', example: false })
    @IsBoolean({ message: '邮件激活标记必须是布尔值' })
    mailActive: boolean

    @ApiProperty({ description: '邮件应用最大数量', example: 1 })
    @IsInt({ message: '邮件应用最大数量必须是整数' })
    @Min(0, { message: '邮件应用最大数量不能小于0' })
    mailMax: number

    @ApiProperty({ description: '社媒业务是否激活', example: false })
    @IsBoolean({ message: '社媒激活标记必须是布尔值' })
    socialActive: boolean

    @ApiProperty({ description: '社媒应用最大数量', example: 1 })
    @IsInt({ message: '社媒应用最大数量必须是整数' })
    @Min(0, { message: '社媒应用最大数量不能小于0' })
    socialMax: number
}

@Index('uk_tb_finance_client_settings_client_key_id', ['clientKeyId'], { unique: true })
@Entity({ name: 'tb_finance_client_settings', comment: '财务客户业务配置表' })
export class TbFinanceClientSettings extends DataBaseAdapter {
    @Column({ name: TbFinanceClientSettingsColumn.CLIENT_KEY_ID, type: 'int', nullable: false, comment: '客户主键' })
    clientKeyId: number

    @Column({
        name: TbFinanceClientSettingsColumn.SMS_ACTIVE,
        type: 'boolean',
        nullable: false,
        default: false,
        comment: '短信业务是否激活'
    })
    smsActive: boolean

    @Column({ name: TbFinanceClientSettingsColumn.SMS_MAX, type: 'int', nullable: false, default: 1, comment: '短信应用最大数量' })
    smsMax: number

    @Column({
        name: TbFinanceClientSettingsColumn.MAIL_ACTIVE,
        type: 'boolean',
        nullable: false,
        default: false,
        comment: '邮件业务是否激活；兼容旧表 main_active 拼写'
    })
    mailActive: boolean

    @Column({ name: TbFinanceClientSettingsColumn.MAIL_MAX, type: 'int', nullable: false, default: 1, comment: '邮件应用最大数量' })
    mailMax: number

    @Column({
        name: TbFinanceClientSettingsColumn.SOCIAL_ACTIVE,
        type: 'boolean',
        nullable: false,
        default: false,
        comment: '社媒业务是否激活；兼容旧表 meta_active 字段'
    })
    socialActive: boolean

    @Column({ name: TbFinanceClientSettingsColumn.SOCIAL_MAX, type: 'int', nullable: false, default: 1, comment: '社媒应用最大数量' })
    socialMax: number
}
