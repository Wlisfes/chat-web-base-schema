import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, defineEnumMetadata } from '@/utils'

/** Skyline 国家/地区基础数据：国际区号、MCC、中英文名称，供 Finance、SMS、SRM 等服务通过 Feign 共享。 */
export enum TbSkylineCountryColumn {
    KEY_ID = 'key_id',
    CODE = 'code',
    MCC = 'mcc',
    CN_NAME = 'cn_name',
    EN_NAME = 'en_name',
    STATUS = 'status',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSkylineCountryStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbSkylineCountryStatusDefinition = defineEnumMetadata(TbSkylineCountryStatus, '国家/地区状态', {
    [TbSkylineCountryStatus.DISABLE]: { label: '禁用', description: '国家/地区不可用于新业务', type: 'error' },
    [TbSkylineCountryStatus.ENABLE]: { label: '启用', description: '国家/地区可正常使用', type: 'success' }
})

export class TbSkylineCountryDto extends DataBaseByDto {
    @ApiProperty({ description: '国家/地区国际区号', example: '86' })
    @IsString({ message: '国家/地区编码必须是字符串' })
    @IsNotEmpty({ message: '国家/地区编码必填' })
    @MaxLength(10, { message: '国家/地区编码长度不能超过10位' })
    code: string

    @ApiProperty({ description: '移动国家代码', example: '460' })
    @IsString({ message: '移动国家代码必须是字符串' })
    @IsNotEmpty({ message: '移动国家代码必填' })
    @MaxLength(4, { message: '移动国家代码长度不能超过4位' })
    mcc: string

    @ApiProperty({ description: '中文名称', example: '中国' })
    @IsString({ message: '中文名称必须是字符串' })
    @IsNotEmpty({ message: '中文名称必填' })
    @MaxLength(64, { message: '中文名称长度不能超过64位' })
    cnName: string

    @ApiProperty({ description: '英文名称', example: 'China' })
    @IsString({ message: '英文名称必须是字符串' })
    @IsNotEmpty({ message: '英文名称必填' })
    @MaxLength(64, { message: '英文名称长度不能超过64位' })
    enName: string

    @ApiProperty({
        description: TbSkylineCountryStatusDefinition.comment,
        enum: TbSkylineCountryStatus,
        enumName: 'TbSkylineCountryStatus',
        example: TbSkylineCountryStatus.ENABLE
    })
    @IsEnum(TbSkylineCountryStatus, { message: '国家/地区状态格式错误' })
    status: TbSkylineCountryStatus
}

@Index('uk_tb_skyline_country_code_mcc', ['code', 'mcc'], { unique: true })
@Index('idx_tb_skyline_country_status', ['status'])
@Entity({ name: 'tb_skyline_country', comment: 'Skyline 国家/地区基础数据表' })
export class TbSkylineCountry extends DataBaseByAdapter {
    @Column({ name: TbSkylineCountryColumn.CODE, type: 'varchar', length: 10, nullable: false, comment: '国家/地区国际区号' })
    code: string

    @Column({ name: TbSkylineCountryColumn.MCC, type: 'varchar', length: 4, nullable: false, comment: '移动国家代码' })
    mcc: string

    @Column({ name: TbSkylineCountryColumn.CN_NAME, type: 'varchar', length: 64, nullable: false, comment: '中文名称' })
    cnName: string

    @Column({ name: TbSkylineCountryColumn.EN_NAME, type: 'varchar', length: 64, nullable: false, comment: '英文名称' })
    enName: string

    @Column({
        name: TbSkylineCountryColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineCountryStatusDefinition.comment
    })
    status: TbSkylineCountryStatus
}
