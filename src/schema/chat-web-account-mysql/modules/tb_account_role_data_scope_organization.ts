import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_account_role_data_scope_organization 的数据库字段名。 */
export enum TbAccountRoleDataScopeOrganizationColumn {
    KEY_ID = 'key_id',
    DATA_SCOPE_UID = 'data_scope_uid',
    ORGANIZATION_UID = 'organization_uid',
    INCLUDE_CHILDREN = 'include_children',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 自定义数据范围中的组织授权完整字段 DTO。 */
export class TbAccountRoleDataScopeOrganizationDto extends DataBaseDto {
    @ApiProperty({ description: '数据范围规则UID', example: '2149446185344106496' })
    @IsString({ message: '数据范围规则UID必须是字符串' })
    @IsNotEmpty({ message: '数据范围规则UID必填' })
    @Length(1, 19, { message: '数据范围规则UID长度不能超过19位' })
    dataScopeUid: string

    @ApiProperty({ description: '授权组织UID', example: '2149446185344106495' })
    @IsString({ message: '授权组织UID必须是字符串' })
    @IsNotEmpty({ message: '授权组织UID必填' })
    @Length(1, 19, { message: '授权组织UID长度不能超过19位' })
    organizationUid: string

    @ApiProperty({ description: '是否同时授权该组织的全部下级组织', example: true })
    @IsBoolean({ message: '包含下级标记必须是布尔值' })
    includeChildren: boolean
}

@Index('uk_tb_account_role_data_scope_organization_grant', ['dataScopeUid', 'organizationUid'], { unique: true })
@Index('idx_tb_account_role_data_scope_organization_org', ['organizationUid'])
@Entity({ name: 'tb_account_role_data_scope_organization', comment: '角色自定义数据范围组织表' })
export class TbAccountRoleDataScopeOrganization extends DataBaseAdapter {
    @Column({
        name: TbAccountRoleDataScopeOrganizationColumn.DATA_SCOPE_UID,
        type: 'varchar',
        length: 19,
        nullable: false,
        comment: '数据范围规则UID'
    })
    dataScopeUid: string

    @Column({
        name: TbAccountRoleDataScopeOrganizationColumn.ORGANIZATION_UID,
        type: 'varchar',
        length: 19,
        nullable: false,
        comment: '授权组织UID'
    })
    organizationUid: string

    @Column({
        name: TbAccountRoleDataScopeOrganizationColumn.INCLUDE_CHILDREN,
        type: 'boolean',
        nullable: false,
        default: false,
        comment: '是否同时授权该组织的全部下级组织'
    })
    includeChildren: boolean
}
