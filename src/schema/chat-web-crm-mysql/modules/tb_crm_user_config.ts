import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, Max, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto } from '@/utils'

export enum TbCrmUserConfigColumn {
    KEY_ID = 'key_id',
    USER_KEY_ID = 'user_key_id',
    SMS_APP_LIMIT = 'sms_app_limit',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 客户未单独配置时的短信应用最大数。 */
export const TB_CRM_USER_CONFIG_DEFAULT_SMS_APP_LIMIT = 5

export class TbCrmUserConfigDto extends DataBaseByDto {
    @ApiProperty({ description: 'CRM 客户主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '短信应用最大数', example: TB_CRM_USER_CONFIG_DEFAULT_SMS_APP_LIMIT })
    @Type(() => Number)
    @IsInt({ message: '短信应用最大数必须是整数' })
    @Min(0, { message: '短信应用最大数不能小于0' })
    @Max(999, { message: '短信应用最大数不能超过999' })
    smsAppLimit: number
}

@Index('uk_tb_crm_user_config_user_key_id', ['userKeyId'], { unique: true })
@Entity({ name: 'tb_crm_user_config', comment: 'CRM 客户配置表' })
export class TbCrmUserConfig extends DataBaseByAdapter {
    @Column({ name: TbCrmUserConfigColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'CRM 客户主键' })
    userKeyId: number

    @Column({
        name: TbCrmUserConfigColumn.SMS_APP_LIMIT,
        type: 'int',
        nullable: false,
        default: TB_CRM_USER_CONFIG_DEFAULT_SMS_APP_LIMIT,
        comment: '短信应用最大数'
    })
    smsAppLimit: number
}
