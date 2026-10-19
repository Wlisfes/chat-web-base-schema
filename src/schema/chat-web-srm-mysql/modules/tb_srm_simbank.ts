import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

export enum TbSrmSimbankColumn {
    KEY_ID = 'key_id',
    NAME = 'name',
    ALIAS = 'alias',
    MODEL = 'model',
    MAC = 'mac',
    TOTAL = 'total',
    USER_KEY_ID = 'user_key_id',
    OWNER_USER_UID = 'owner_user_uid',
    STATUS = 'status',
    ONLINE = 'online',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmSimbankStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSrmSimbankStatusDefinition = defineEnumMetadata(TbSrmSimbankStatus, '设备状态', {
    [TbSrmSimbankStatus.DISABLE]: { label: '停用', description: '设备已停用', type: 'error' },
    [TbSrmSimbankStatus.ENABLE]: { label: '启用', description: '设备正常使用', type: 'success' }
})

export enum TbSrmSimbankOnline {
    OFFLINE = 'offline',
    ONLINE = 'online'
}

export const TbSrmSimbankOnlineDefinition = defineEnumMetadata(TbSrmSimbankOnline, '在线状态', {
    [TbSrmSimbankOnline.OFFLINE]: { label: '离线', description: '设备未连接', type: 'default' },
    [TbSrmSimbankOnline.ONLINE]: { label: '在线', description: '设备已连接', type: 'success' }
})

export class TbSrmSimbankDto extends DataBaseByDto {
    @ApiProperty({ description: '设备名称', example: 'SIMBANK-01' })
    @IsString({ message: '设备名称必须是字符串' })
    @IsNotEmpty({ message: '设备名称必填' })
    @MaxLength(64, { message: '设备名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '设备别名：自定义的设备简称，全表唯一', example: 'SB-HK-01', required: false })
    @IsOptional()
    @IsString({ message: '设备别名必须是字符串' })
    @MaxLength(64, { message: '设备别名长度不能超过64位' })
    alias: string

    @ApiProperty({ description: '设备型号：Skyline 枚举 CHUNK_SRM_SIMBANK_MODEL 的枚举项主键', example: 1024316 })
    @Type(() => Number)
    @IsInt({ message: '设备型号必须是整数' })
    @Min(1, { message: '设备型号必须大于0' })
    model: number

    @ApiProperty({ description: 'MAC地址，格式 AA:BB:CC:DD:EE:FF，全表唯一', example: 'AA:BB:CC:DD:EE:FF' })
    @IsString({ message: 'MAC地址必须是字符串' })
    @Matches(/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/, { message: 'MAC地址格式错误' })
    mac: string

    @ApiProperty({ description: '端口数：由设备型号枚举扩展配置 json.total 决定', example: 32 })
    @Type(() => Number)
    @IsInt({ message: '端口数必须是整数' })
    @Min(1, { message: '端口数不能小于1' })
    @Max(65535, { message: '端口数不能大于65535' })
    total: number

    @ApiProperty({ description: '归属供应商：SRM 供应商主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '归属供应商必须是整数' })
    @Min(1, { message: '归属供应商必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '归属人账号UID', example: '2149446185344106496' })
    @IsString({ message: '归属人账号UID必须是字符串' })
    @Length(1, 19, { message: '归属人账号UID长度不能超过19位' })
    ownerUserUid: string

    @ApiProperty({
        description: TbSrmSimbankStatusDefinition.comment,
        enum: TbSrmSimbankStatus,
        enumName: 'TbSrmSimbankStatus',
        example: TbSrmSimbankStatus.ENABLE
    })
    @IsEnum(TbSrmSimbankStatus, { message: '设备状态格式错误' })
    status: TbSrmSimbankStatus

    @ApiProperty({
        description: TbSrmSimbankOnlineDefinition.comment,
        enum: TbSrmSimbankOnline,
        enumName: 'TbSrmSimbankOnline',
        example: TbSrmSimbankOnline.OFFLINE
    })
    @IsEnum(TbSrmSimbankOnline, { message: '在线状态格式错误' })
    online: TbSrmSimbankOnline
}

@Index('uk_tb_srm_simbank_mac', ['mac'], { unique: true })
@Index('uk_tb_srm_simbank_alias', ['alias'], { unique: true })
@Index('idx_tb_srm_simbank_user_key_id', ['userKeyId'])
@Index('idx_tb_srm_simbank_owner_user_uid', ['ownerUserUid'])
@Index('idx_tb_srm_simbank_model', ['model'])
@Index('idx_tb_srm_simbank_status', ['status'])
@Index('idx_tb_srm_simbank_online', ['online'])
@Entity({ name: 'tb_srm_simbank', comment: 'SRM SIMBANK 设备表' })
export class TbSrmSimbank extends DataBaseByAdapter {
    @Column({ name: TbSrmSimbankColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '设备名称' })
    name: string

    @Column({
        name: TbSrmSimbankColumn.ALIAS,
        type: 'varchar',
        length: 64,
        nullable: true,
        comment: '设备别名：自定义的设备简称，全表唯一'
    })
    alias: string

    @Column({
        name: TbSrmSimbankColumn.MODEL,
        type: 'int',
        nullable: false,
        comment: '设备型号：Skyline 枚举 CHUNK_SRM_SIMBANK_MODEL 的枚举项主键'
    })
    model: number

    @Column({
        name: TbSrmSimbankColumn.MAC,
        type: 'varchar',
        length: 17,
        nullable: false,
        comment: 'MAC地址，格式 AA:BB:CC:DD:EE:FF，全表唯一'
    })
    mac: string

    @Column({
        name: TbSrmSimbankColumn.TOTAL,
        type: 'int',
        nullable: false,
        comment: '端口数：由设备型号枚举扩展配置 json.total 决定'
    })
    total: number

    @Column({ name: TbSrmSimbankColumn.USER_KEY_ID, type: 'int', nullable: false, comment: '归属供应商：SRM 供应商主键' })
    userKeyId: number

    @Column({ name: TbSrmSimbankColumn.OWNER_USER_UID, type: 'varchar', length: 19, nullable: false, comment: '归属人账号UID' })
    ownerUserUid: string

    @Column({
        name: TbSrmSimbankColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmSimbankStatus.ENABLE,
        comment: TbSrmSimbankStatusDefinition.comment
    })
    status: TbSrmSimbankStatus

    @Column({
        name: TbSrmSimbankColumn.ONLINE,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmSimbankOnline.OFFLINE,
        comment: TbSrmSimbankOnlineDefinition.comment
    })
    online: TbSrmSimbankOnline
}
