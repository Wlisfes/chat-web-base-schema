import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbSrmSimbankPortColumn {
    KEY_ID = 'key_id',
    SIMBANK_KEY_ID = 'simbank_key_id',
    PORT = 'port',
    SIM = 'sim',
    ICCID = 'iccid',
    IMEI = 'imei',
    ACTIVATE_STATUS = 'activate_status',
    COUNTRY_KEY_ID = 'country_key_id',
    INSERT_STATUS = 'insert_status',
    STATUS = 'status',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmSimbankPortStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmSimbankPortStatusDefinition = defineEnumMetadata(TbSrmSimbankPortStatus, '端口状态', {
    [TbSrmSimbankPortStatus.DISABLE]: { label: '禁用', description: '端口已停用', type: 'error' },
    [TbSrmSimbankPortStatus.ENABLE]: { label: '启用', description: '端口正常使用', type: 'success' }
})

export enum TbSrmSimbankPortActivateStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export const TbSrmSimbankPortActivateStatusDefinition = defineEnumMetadata(TbSrmSimbankPortActivateStatus, '激活状态', {
    [TbSrmSimbankPortActivateStatus.INACTIVE]: { label: '未激活', description: 'SIM 卡尚未激活', type: 'default' },
    [TbSrmSimbankPortActivateStatus.ACTIVE]: { label: '已激活', description: 'SIM 卡已完成激活', type: 'success' }
})

export enum TbSrmSimbankPortInsertStatus {
    INSERTED = 'inserted',
    REMOVED = 'removed'
}

export const TbSrmSimbankPortInsertStatusDefinition = defineEnumMetadata(TbSrmSimbankPortInsertStatus, '插卡状态', {
    [TbSrmSimbankPortInsertStatus.REMOVED]: { label: '未插卡', description: '端口当前没有插入 SIM 卡', type: 'default' },
    [TbSrmSimbankPortInsertStatus.INSERTED]: { label: '已插卡', description: '端口当前已插入 SIM 卡', type: 'success' }
})

export class TbSrmSimbankPortDto extends DataBaseByDto {
    @ApiProperty({ description: '设备ID：SRM SIMBANK 设备主键', example: 100201 })
    @Type(() => Number)
    @IsInt({ message: '设备ID必须是整数' })
    @Min(1, { message: '设备ID必须大于0' })
    simbankKeyId: number

    @ApiProperty({ description: '端口编号：从 1 开始，同一设备内唯一', example: 1 })
    @Type(() => Number)
    @IsInt({ message: '端口编号必须是整数' })
    @Min(1, { message: '端口编号不能小于1' })
    @Max(65535, { message: '端口编号不能大于65535' })
    port: number

    @ApiProperty({ description: 'SIM 卡号码：国际区号 + 号码，不带 + 号', example: '8613800000000', required: false })
    @IsOptional()
    @IsString({ message: 'SIM 卡号码必须是字符串' })
    @MaxLength(32, { message: 'SIM 卡号码长度不能超过32位' })
    sim: string

    @ApiProperty({ description: 'ICCID：SIM 卡唯一编号，有值时全表唯一', example: '89860000000000000000', required: false })
    @IsOptional()
    @IsString({ message: 'ICCID 必须是字符串' })
    @MaxLength(22, { message: 'ICCID 长度不能超过22位' })
    iccid: string

    @ApiProperty({ description: 'IMEI：端口模块识别码', example: '860000000000000', required: false })
    @IsOptional()
    @IsString({ message: 'IMEI 必须是字符串' })
    @MaxLength(15, { message: 'IMEI 长度不能超过15位' })
    imei: string

    @ApiProperty({
        description: TbSrmSimbankPortActivateStatusDefinition.comment,
        enum: TbSrmSimbankPortActivateStatus,
        enumName: 'TbSrmSimbankPortActivateStatus',
        example: TbSrmSimbankPortActivateStatus.INACTIVE
    })
    @IsEnum(TbSrmSimbankPortActivateStatus, { message: '激活状态格式错误' })
    activateStatus: TbSrmSimbankPortActivateStatus

    @ApiProperty({ description: '激活方向：Skyline 国家/地区主键；激活后必填', example: 1024, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: '激活方向必须是整数' })
    @Min(1, { message: '激活方向必须大于0' })
    countryKeyId: number

    @ApiProperty({
        description: TbSrmSimbankPortInsertStatusDefinition.comment,
        enum: TbSrmSimbankPortInsertStatus,
        enumName: 'TbSrmSimbankPortInsertStatus',
        example: TbSrmSimbankPortInsertStatus.REMOVED
    })
    @IsEnum(TbSrmSimbankPortInsertStatus, { message: '插卡状态格式错误' })
    insertStatus: TbSrmSimbankPortInsertStatus

    @ApiProperty({
        description: TbSrmSimbankPortStatusDefinition.comment,
        enum: TbSrmSimbankPortStatus,
        enumName: 'TbSrmSimbankPortStatus',
        example: TbSrmSimbankPortStatus.ENABLE
    })
    @IsEnum(TbSrmSimbankPortStatus, { message: '端口状态格式错误' })
    status: TbSrmSimbankPortStatus
}

@Index('uk_tb_srm_simbank_port_simbank_port', ['simbankKeyId', 'port'], { unique: true })
@Index('uk_tb_srm_simbank_port_iccid', ['iccid'], { unique: true })
@Index('idx_tb_srm_simbank_port_sim', ['sim'])
@Index('idx_tb_srm_simbank_port_imei', ['imei'])
@Index('idx_tb_srm_simbank_port_activate_status', ['activateStatus'])
@Index('idx_tb_srm_simbank_port_country_key_id', ['countryKeyId'])
@Index('idx_tb_srm_simbank_port_insert_status', ['insertStatus'])
@Index('idx_tb_srm_simbank_port_status', ['status'])
@Entity({ name: 'tb_srm_simbank_port', comment: 'SRM SIMBANK 端口表' })
export class TbSrmSimbankPort extends DataBaseByAdapter {
    @Column({ name: TbSrmSimbankPortColumn.SIMBANK_KEY_ID, type: 'int', nullable: false, comment: '设备ID：SRM SIMBANK 设备主键' })
    simbankKeyId: number

    @Column({ name: TbSrmSimbankPortColumn.PORT, type: 'int', nullable: false, comment: '端口编号：从 1 开始，同一设备内唯一' })
    port: number

    @Column({ name: TbSrmSimbankPortColumn.SIM, type: 'varchar', length: 32, nullable: true, comment: 'SIM 卡号码' })
    sim: string

    @Column({
        name: TbSrmSimbankPortColumn.ICCID,
        type: 'varchar',
        length: 22,
        nullable: true,
        comment: 'ICCID：SIM 卡唯一编号，有值时全表唯一'
    })
    iccid: string

    @Column({ name: TbSrmSimbankPortColumn.IMEI, type: 'varchar', length: 15, nullable: true, comment: 'IMEI：端口模块识别码' })
    imei: string

    @Column({
        name: TbSrmSimbankPortColumn.ACTIVATE_STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmSimbankPortActivateStatus.INACTIVE,
        comment: TbSrmSimbankPortActivateStatusDefinition.comment
    })
    activateStatus: TbSrmSimbankPortActivateStatus

    @Column({
        name: TbSrmSimbankPortColumn.COUNTRY_KEY_ID,
        type: 'int',
        nullable: true,
        comment: '激活方向：Skyline 国家/地区主键；激活后必填'
    })
    countryKeyId: number

    @Column({
        name: TbSrmSimbankPortColumn.INSERT_STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmSimbankPortInsertStatus.REMOVED,
        comment: TbSrmSimbankPortInsertStatusDefinition.comment
    })
    insertStatus: TbSrmSimbankPortInsertStatus

    @Column({
        name: TbSrmSimbankPortColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmSimbankPortStatus.ENABLE,
        comment: TbSrmSimbankPortStatusDefinition.comment
    })
    status: TbSrmSimbankPortStatus
}
