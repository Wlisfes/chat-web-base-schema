import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_account_organization 的数据库字段名。 */
export enum TbAccountOrganizationColumn {
    KEY_ID = 'key_id',
    UID = 'uid',
    PARENT_UID = 'parent_uid',
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
export enum TbAccountOrganizationType {
    COMPANY = 'company',
    DEPARTMENT = 'department',
    TEAM = 'team'
}

export const TbAccountOrganizationTypeDefinition = defineEnumMetadata(TbAccountOrganizationType, '组织类型', {
    [TbAccountOrganizationType.COMPANY]: { label: '公司', description: '组织架构的公司或法人主体节点' },
    [TbAccountOrganizationType.DEPARTMENT]: { label: '部门', description: '正式部门节点' },
    [TbAccountOrganizationType.TEAM]: { label: '团队', description: '项目组等非正式团队节点' }
})

export const {
    metadata: TbAccountOrganizationTypeMetadata,
    options: TbAccountOrganizationTypeOptions,
    count: TbAccountOrganizationTypeCount,
    comment: TbAccountOrganizationTypeComment
} = TbAccountOrganizationTypeDefinition

/** 组织节点状态。 */
export enum TbAccountOrganizationStatus {
    DISABLED = 'disabled',
    ENABLED = 'enabled'
}

export const TbAccountOrganizationStatusDefinition = defineEnumMetadata(TbAccountOrganizationStatus, '组织状态', {
    [TbAccountOrganizationStatus.DISABLED]: { label: '禁用', description: '组织节点不可再用于新增授权或成员关系' },
    [TbAccountOrganizationStatus.ENABLED]: { label: '启用', description: '组织节点正常使用' }
})

export const {
    metadata: TbAccountOrganizationStatusMetadata,
    options: TbAccountOrganizationStatusOptions,
    count: TbAccountOrganizationStatusCount,
    comment: TbAccountOrganizationStatusComment
} = TbAccountOrganizationStatusDefinition

/** 组织架构节点的完整字段 DTO。 */
export class TbAccountOrganizationDto extends DataBaseDto {
    @ApiProperty({ description: '组织UID', example: '2149446185344106496' })
    @IsString({ message: '组织UID必须是字符串' })
    @IsNotEmpty({ message: '组织UID必填' })
    @Length(1, 19, { message: '组织UID长度不能超过19位' })
    uid: string

    @ApiProperty({ description: '父组织UID；根节点为空', example: '2149446185344106495', required: false })
    @IsOptional()
    @IsString({ message: '父组织UID必须是字符串' })
    @Length(1, 19, { message: '父组织UID长度不能超过19位' })
    parentUid: string

    @ApiProperty({ description: '组织编码', example: 'RD' })
    @IsString({ message: '组织编码必须是字符串' })
    @IsNotEmpty({ message: '组织编码必填' })
    @MaxLength(64, { message: '组织编码长度不能超过64位' })
    code: string

    @ApiProperty({ description: '组织名称', example: '研发部' })
    @IsString({ message: '组织名称必须是字符串' })
    @IsNotEmpty({ message: '组织名称必填' })
    @MaxLength(64, { message: '组织名称长度不能超过64位' })
    name: string

    @ApiProperty({
        description: TbAccountOrganizationTypeComment,
        enum: TbAccountOrganizationType,
        enumName: 'TbAccountOrganizationType',
        example: TbAccountOrganizationType.DEPARTMENT
    })
    @IsEnum(TbAccountOrganizationType, { message: '组织类型格式错误' })
    type: TbAccountOrganizationType

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
        description: TbAccountOrganizationStatusComment,
        enum: TbAccountOrganizationStatus,
        enumName: 'TbAccountOrganizationStatus',
        example: TbAccountOrganizationStatus.ENABLED
    })
    @IsEnum(TbAccountOrganizationStatus, { message: '组织状态格式错误' })
    status: TbAccountOrganizationStatus
}

@Index('uk_tb_account_organization_uid', ['uid'], { unique: true })
@Index('uk_tb_account_organization_code', ['code'], { unique: true })
@Index('idx_tb_account_organization_parent_sort', ['parentUid', 'sort'])
@Entity({ name: 'tb_account_organization', comment: '组织架构表' })
export class TbAccountOrganization extends DataBaseAdapter {
    @Column({ name: TbAccountOrganizationColumn.UID, type: 'varchar', length: 19, nullable: false, update: false, comment: '组织UID' })
    uid: string

    @Column({ name: TbAccountOrganizationColumn.PARENT_UID, type: 'varchar', length: 19, nullable: true, comment: '父组织UID' })
    parentUid: string

    @Column({ name: TbAccountOrganizationColumn.CODE, type: 'varchar', length: 64, nullable: false, comment: '组织编码' })
    code: string

    @Column({ name: TbAccountOrganizationColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '组织名称' })
    name: string

    @Column({
        name: TbAccountOrganizationColumn.TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbAccountOrganizationTypeComment
    })
    type: TbAccountOrganizationType

    @Column({ name: TbAccountOrganizationColumn.LEADER_USER_UID, type: 'varchar', length: 19, nullable: true, comment: '负责人账号UID' })
    leaderUserUid: string

    @Column({ name: TbAccountOrganizationColumn.SORT, type: 'int', nullable: false, default: 0, comment: '同级排序值' })
    sort: number

    @Column({
        name: TbAccountOrganizationColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbAccountOrganizationStatusComment
    })
    status: TbAccountOrganizationStatus
}
