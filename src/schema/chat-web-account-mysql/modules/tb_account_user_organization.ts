import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_account_user_organization 的数据库字段名。 */
export enum TbAccountUserOrganizationColumn {
    KEY_ID = 'key_id',
    USER_UID = 'user_uid',
    ORGANIZATION_UID = 'organization_uid',
    IS_PRIMARY = 'is_primary',
    POSITION_NAME = 'position_name',
    STATUS = 'status',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 用户组织成员关系状态。 */
export enum TbAccountUserOrganizationStatus {
    DISABLED = 'disabled',
    ENABLED = 'enabled'
}

export const TbAccountUserOrganizationStatusDefinition = defineEnumMetadata(TbAccountUserOrganizationStatus, '用户组织关系状态', {
    [TbAccountUserOrganizationStatus.DISABLED]: { label: '禁用', description: '成员关系暂不参与组织和权限计算' },
    [TbAccountUserOrganizationStatus.ENABLED]: { label: '启用', description: '成员关系正常参与组织和权限计算' }
})

export const {
    metadata: TbAccountUserOrganizationStatusMetadata,
    options: TbAccountUserOrganizationStatusOptions,
    count: TbAccountUserOrganizationStatusCount,
    comment: TbAccountUserOrganizationStatusComment
} = TbAccountUserOrganizationStatusDefinition

/** 用户与组织成员关系的完整字段 DTO。 */
export class TbAccountUserOrganizationDto extends DataBaseDto {
    @ApiProperty({ description: '账号UID', example: '2149446185344106496' })
    @IsString({ message: '账号UID必须是字符串' })
    @IsNotEmpty({ message: '账号UID必填' })
    @Length(1, 19, { message: '账号UID长度不能超过19位' })
    userUid: string

    @ApiProperty({ description: '组织UID', example: '2149446185344106495' })
    @IsString({ message: '组织UID必须是字符串' })
    @IsNotEmpty({ message: '组织UID必填' })
    @Length(1, 19, { message: '组织UID长度不能超过19位' })
    organizationUid: string

    @ApiProperty({ description: '是否为用户主组织', example: true })
    @IsBoolean({ message: '主组织标记必须是布尔值' })
    isPrimary: boolean

    @ApiProperty({ description: '用户在该组织中的岗位名称', example: '研发工程师', required: false })
    @IsOptional()
    @IsString({ message: '岗位名称必须是字符串' })
    @MaxLength(64, { message: '岗位名称长度不能超过64位' })
    positionName: string

    @ApiProperty({
        description: TbAccountUserOrganizationStatusComment,
        enum: TbAccountUserOrganizationStatus,
        enumName: 'TbAccountUserOrganizationStatus',
        example: TbAccountUserOrganizationStatus.ENABLED
    })
    @IsEnum(TbAccountUserOrganizationStatus, { message: '用户组织关系状态格式错误' })
    status: TbAccountUserOrganizationStatus
}

@Index('uk_tb_account_user_organization_member', ['userUid', 'organizationUid'], { unique: true })
@Index('idx_tb_account_user_organization_org_status', ['organizationUid', 'status'])
@Entity({ name: 'tb_account_user_organization', comment: '用户组织成员关系表' })
export class TbAccountUserOrganization extends DataBaseAdapter {
    @Column({ name: TbAccountUserOrganizationColumn.USER_UID, type: 'varchar', length: 19, nullable: false, comment: '账号UID' })
    userUid: string

    @Column({ name: TbAccountUserOrganizationColumn.ORGANIZATION_UID, type: 'varchar', length: 19, nullable: false, comment: '组织UID' })
    organizationUid: string

    @Column({
        name: TbAccountUserOrganizationColumn.IS_PRIMARY,
        type: 'boolean',
        nullable: false,
        default: false,
        comment: '是否为用户主组织'
    })
    isPrimary: boolean

    @Column({
        name: TbAccountUserOrganizationColumn.POSITION_NAME,
        type: 'varchar',
        length: 64,
        nullable: true,
        comment: '用户在该组织中的岗位名称'
    })
    positionName: string

    @Column({
        name: TbAccountUserOrganizationColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbAccountUserOrganizationStatusComment
    })
    status: TbAccountUserOrganizationStatus
}
