import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, Max, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto } from '@/utils'

export enum TbSrmUserConfigColumn {
    KEY_ID = 'key_id',
    USER_KEY_ID = 'user_key_id',
    SIMBANK_LIMIT = 'simbank_limit',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 供应商未单独配置时的 SIMBANK 设备最大数。 */
export const TB_SRM_USER_CONFIG_DEFAULT_SIMBANK_LIMIT = 5

/** 供应商配置：一个供应商一条配置，新增供应商时同步创建；包含 SIMBANK 设备最大数等供应商级配置。 */
export class TbSrmUserConfigDto extends DataBaseByDto {
    @ApiProperty({ description: 'SRM 供应商主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '供应商主键必须是整数' })
    @Min(1, { message: '供应商主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: 'SIMBANK 设备最大数', example: TB_SRM_USER_CONFIG_DEFAULT_SIMBANK_LIMIT })
    @Type(() => Number)
    @IsInt({ message: 'SIMBANK 设备最大数必须是整数' })
    @Min(0, { message: 'SIMBANK 设备最大数不能小于0' })
    @Max(999, { message: 'SIMBANK 设备最大数不能超过999' })
    simbankLimit: number
}

@Index('uk_tb_srm_user_config_user_key_id', ['userKeyId'], { unique: true })
@Entity({ name: 'tb_srm_user_config', comment: 'SRM 供应商配置表' })
export class TbSrmUserConfig extends DataBaseByAdapter {
    @Column({ name: TbSrmUserConfigColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'SRM 供应商主键' })
    userKeyId: number

    @Column({
        name: TbSrmUserConfigColumn.SIMBANK_LIMIT,
        type: 'int',
        nullable: false,
        default: TB_SRM_USER_CONFIG_DEFAULT_SIMBANK_LIMIT,
        comment: 'SIMBANK 设备最大数'
    })
    simbankLimit: number
}
