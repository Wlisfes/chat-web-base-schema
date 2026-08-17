import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsInt, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_account_role_data_scope_organization 的数据库字段名。 */
export enum TbAccountRoleDataScopeOrganizationColumn {
    KEY_ID = 'key_id',
    DATA_SCOPE_KEY_ID = 'data_scope_key_id',
    ORGANIZATION_KEY_ID = 'organization_key_id',
    INCLUDE_CHILDREN = 'include_children',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 自定义数据范围中的组织授权完整字段 DTO。 */
export class TbAccountRoleDataScopeOrganizationDto extends DataBaseDto {
    @ApiProperty({ description: '数据范围规则主键', example: 1 })
    @IsInt({ message: '数据范围规则主键必须是整数' })
    @Min(1, { message: '数据范围规则主键必须大于0' })
    dataScopeKeyId: number

    @ApiProperty({ description: '授权组织主键', example: 1 })
    @IsInt({ message: '授权组织主键必须是整数' })
    @Min(1, { message: '授权组织主键必须大于0' })
    organizationKeyId: number

    @ApiProperty({ description: '是否同时授权该组织的全部下级组织', example: true })
    @IsBoolean({ message: '包含下级标记必须是布尔值' })
    includeChildren: boolean
}

@Index('uk_tb_account_role_data_scope_organization_grant', ['dataScopeKeyId', 'organizationKeyId'], { unique: true })
@Index('idx_tb_account_role_data_scope_organization_org', ['organizationKeyId'])
@Entity({ name: 'tb_account_role_data_scope_organization', comment: '角色自定义数据范围组织表' })
export class TbAccountRoleDataScopeOrganization extends DataBaseAdapter {
    @Column({
        name: TbAccountRoleDataScopeOrganizationColumn.DATA_SCOPE_KEY_ID,
        type: 'int',
        nullable: false,
        comment: '数据范围规则主键'
    })
    dataScopeKeyId: number

    @Column({
        name: TbAccountRoleDataScopeOrganizationColumn.ORGANIZATION_KEY_ID,
        type: 'int',
        nullable: false,
        comment: '授权组织主键'
    })
    organizationKeyId: number

    @Column({
        name: TbAccountRoleDataScopeOrganizationColumn.INCLUDE_CHILDREN,
        type: 'boolean',
        nullable: false,
        default: false,
        comment: '是否同时授权该组织的全部下级组织'
    })
    includeChildren: boolean
}
