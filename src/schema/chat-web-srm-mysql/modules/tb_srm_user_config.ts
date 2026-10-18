import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto } from '@/utils'

export enum TbSrmUserConfigColumn {
    KEY_ID = 'key_id',
    USER_KEY_ID = 'user_key_id',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 供应商配置：一个供应商一条配置，新增供应商时同步创建；SRM 无短信应用概念，后续供应商级配置项在此表扩展。 */
export class TbSrmUserConfigDto extends DataBaseByDto {
    @ApiProperty({ description: 'SRM 供应商主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '供应商主键必须是整数' })
    @Min(1, { message: '供应商主键必须大于0' })
    userKeyId: number
}

@Index('uk_tb_srm_user_config_user_key_id', ['userKeyId'], { unique: true })
@Entity({ name: 'tb_srm_user_config', comment: 'SRM 供应商配置表' })
export class TbSrmUserConfig extends DataBaseByAdapter {
    @Column({ name: TbSrmUserConfigColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'SRM 供应商主键' })
    userKeyId: number
}
