import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_skyline_organization 的数据库字段名。 */
export enum TbSkylineOrganizationColumn {
    KEY_ID = 'key_id',
    PARENT_KEY_ID = 'parent_key_id',
    CODE = 'code',
    NAME = 'name',
    TYPE = 'type',
    LEADER_USER_UID = 'leader_user_uid',
    SORT = 'sort',
    STATUS = 'status',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 组织节点类型。 */
export enum TbSkylineOrganizationType {
    COMPANY = 'company',
    DEPARTMENT = 'department',
    TEAM = 'team'
}

export const TbSkylineOrganizationTypeDefinition = defineEnumMetadata(TbSkylineOrganizationType, '组织类型', {
    [TbSkylineOrganizationType.COMPANY]: { label: '公司', description: '组织架构的公司或法人主体节点', type: 'geekblue' },
    [TbSkylineOrganizationType.DEPARTMENT]: { label: '部门', description: '正式部门节点', type: 'blue' },
    [TbSkylineOrganizationType.TEAM]: { label: '团队', description: '项目组等非正式团队节点', type: 'cyan' }
})

/** 组织节点状态。 */
export enum TbSkylineOrganizationStatus {
    DISABLED = 'disabled',
    ENABLED = 'enabled'
}

export const TbSkylineOrganizationStatusDefinition = defineEnumMetadata(TbSkylineOrganizationStatus, '组织状态', {
    [TbSkylineOrganizationStatus.DISABLED]: { label: '禁用', description: '组织节点不可再用于新增授权或成员关系', type: 'error' },
    [TbSkylineOrganizationStatus.ENABLED]: { label: '启用', description: '组织节点正常使用', type: 'success' }
})

/** 组织架构节点的完整字段 DTO。 */
export class TbSkylineOrganizationDto extends DataBaseDto {
    @ApiProperty({ description: '父组织主键；根节点为空', example: 1, required: false })
    @IsOptional()
    @IsInt({ message: '父组织主键必须是整数' })
    @Min(1, { message: '父组织主键必须大于0' })
    parentKeyId: number

    @ApiProperty({ description: '组织编码；非必填', example: 'RD', required: false })
    @IsOptional()
    @IsString({ message: '组织编码必须是字符串' })
    @MaxLength(64, { message: '组织编码长度不能超过64位' })
    code: string

    @ApiProperty({ description: '组织名称', example: '研发部' })
    @IsString({ message: '组织名称必须是字符串' })
    @IsNotEmpty({ message: '组织名称必填' })
    @MaxLength(64, { message: '组织名称长度不能超过64位' })
    name: string

    @ApiProperty({
        description: TbSkylineOrganizationTypeDefinition.comment,
        enum: TbSkylineOrganizationType,
        enumName: 'TbSkylineOrganizationType',
        example: TbSkylineOrganizationType.DEPARTMENT
    })
    @IsEnum(TbSkylineOrganizationType, { message: '组织类型格式错误' })
    type: TbSkylineOrganizationType

    @ApiProperty({ description: '负责人账号UID', example: '2149446185344106496', required: false })
    @IsOptional()
    @IsString({ message: '负责人账号UID必须是字符串' })
    @Length(1, 19, { message: '负责人账号UID长度不能超过19位' })
    leaderUserUid: string

    @ApiProperty({ description: '同级排序值', example: 10 })
    @IsInt({ message: '排序值必须是整数' })
    @Min(0, { message: '排序值不能小于0' })
    sort: number

    @ApiProperty({
        description: TbSkylineOrganizationStatusDefinition.comment,
        enum: TbSkylineOrganizationStatus,
        enumName: 'TbSkylineOrganizationStatus',
        example: TbSkylineOrganizationStatus.ENABLED
    })
    @IsEnum(TbSkylineOrganizationStatus, { message: '组织状态格式错误' })
    status: TbSkylineOrganizationStatus
}

@Index('uk_tb_skyline_organization_code', ['code'], { unique: true })
@Index('idx_tb_skyline_organization_parent_sort', ['parentKeyId', 'sort'])
@Entity({ name: 'tb_skyline_organization', comment: '组织架构表' })
export class TbSkylineOrganization extends DataBaseAdapter {
    @Column({ name: TbSkylineOrganizationColumn.PARENT_KEY_ID, type: 'int', nullable: true, comment: '父组织主键' })
    parentKeyId: number

    @Column({ name: TbSkylineOrganizationColumn.CODE, type: 'varchar', length: 64, nullable: true, comment: '组织编码' })
    code: string

    @Column({ name: TbSkylineOrganizationColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '组织名称' })
    name: string

    @Column({
        name: TbSkylineOrganizationColumn.TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineOrganizationTypeDefinition.comment
    })
    type: TbSkylineOrganizationType

    @Column({ name: TbSkylineOrganizationColumn.LEADER_USER_UID, type: 'varchar', length: 19, nullable: true, comment: '负责人账号UID' })
    leaderUserUid: string

    @Column({ name: TbSkylineOrganizationColumn.SORT, type: 'int', nullable: false, default: 0, comment: '同级排序值' })
    sort: number

    @Column({
        name: TbSkylineOrganizationColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineOrganizationStatusDefinition.comment
    })
    status: TbSkylineOrganizationStatus
}
