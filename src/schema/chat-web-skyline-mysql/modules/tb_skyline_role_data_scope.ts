import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_skyline_role_data_scope 的数据库字段名。 */
export enum TbSkylineRoleDataScopeColumn {
    KEY_ID = 'key_id',
    ROLE_KEY_ID = 'role_key_id',
    RESOURCE_CODE = 'resource_code',
    SCOPE_TYPE = 'scope_type',
    STATUS = 'status',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 数据权限范围类型。 */
export enum TbSkylineRoleDataScopeType {
    ALL = 'all',
    SELF = 'self',
    ORGANIZATION = 'organization',
    ORGANIZATION_TREE = 'organization_tree',
    CUSTOM = 'custom'
}

export const TbSkylineRoleDataScopeTypeDefinition = defineEnumMetadata(TbSkylineRoleDataScopeType, '数据范围类型', {
    [TbSkylineRoleDataScopeType.ALL]: { label: '全部数据', description: '不限制组织或数据所有人', type: 'purple' },
    [TbSkylineRoleDataScopeType.SELF]: { label: '仅本人', description: '只允许访问本人拥有的数据', type: 'cyan' },
    [TbSkylineRoleDataScopeType.ORGANIZATION]: { label: '本组织', description: '允许访问用户主组织的数据', type: 'blue' },
    [TbSkylineRoleDataScopeType.ORGANIZATION_TREE]: {
        label: '本组织及下级',
        description: '允许访问用户主组织及全部下级组织的数据',
        type: 'geekblue'
    },
    [TbSkylineRoleDataScopeType.CUSTOM]: { label: '自定义组织', description: '允许访问显式授权的组织，可逐项包含下级组织', type: 'orange' }
})

/** 数据范围规则状态。 */
export enum TbSkylineRoleDataScopeStatus {
    DISABLED = 'disabled',
    ENABLED = 'enabled'
}

export const TbSkylineRoleDataScopeStatusDefinition = defineEnumMetadata(TbSkylineRoleDataScopeStatus, '数据范围规则状态', {
    [TbSkylineRoleDataScopeStatus.DISABLED]: { label: '禁用', description: '规则不参与数据权限计算', type: 'error' },
    [TbSkylineRoleDataScopeStatus.ENABLED]: { label: '启用', description: '规则正常参与数据权限计算', type: 'success' }
})

/** 角色针对业务资源的数据范围规则完整字段 DTO。 */
export class TbSkylineRoleDataScopeDto extends DataBaseDto {
    @ApiProperty({ description: '角色主键', example: 1 })
    @IsInt({ message: '角色主键必须是整数' })
    @Min(1, { message: '角色主键必须大于0' })
    roleKeyId: number

    @ApiProperty({ description: '业务资源编码；星号表示默认规则', example: 'skyline:user' })
    @IsString({ message: '业务资源编码必须是字符串' })
    @IsNotEmpty({ message: '业务资源编码必填' })
    @MaxLength(128, { message: '业务资源编码长度不能超过128位' })
    resourceCode: string

    @ApiProperty({
        description: TbSkylineRoleDataScopeTypeDefinition.comment,
        enum: TbSkylineRoleDataScopeType,
        enumName: 'TbSkylineRoleDataScopeType',
        example: TbSkylineRoleDataScopeType.ORGANIZATION_TREE
    })
    @IsEnum(TbSkylineRoleDataScopeType, { message: '数据范围类型格式错误' })
    scopeType: TbSkylineRoleDataScopeType

    @ApiProperty({
        description: TbSkylineRoleDataScopeStatusDefinition.comment,
        enum: TbSkylineRoleDataScopeStatus,
        enumName: 'TbSkylineRoleDataScopeStatus',
        example: TbSkylineRoleDataScopeStatus.ENABLED
    })
    @IsEnum(TbSkylineRoleDataScopeStatus, { message: '数据范围规则状态格式错误' })
    status: TbSkylineRoleDataScopeStatus
}

@Index('uk_tb_skyline_role_data_scope_resource', ['roleKeyId', 'resourceCode'], { unique: true })
@Index('idx_tb_skyline_role_data_scope_resource_status', ['resourceCode', 'status'])
@Entity({ name: 'tb_skyline_role_data_scope', comment: '角色数据范围规则表' })
export class TbSkylineRoleDataScope extends DataBaseAdapter {
    @Column({ name: TbSkylineRoleDataScopeColumn.ROLE_KEY_ID, type: 'int', nullable: false, comment: '角色主键' })
    roleKeyId: number

    @Column({
        name: TbSkylineRoleDataScopeColumn.RESOURCE_CODE,
        type: 'varchar',
        length: 128,
        nullable: false,
        comment: '业务资源编码；星号表示默认规则'
    })
    resourceCode: string

    @Column({
        name: TbSkylineRoleDataScopeColumn.SCOPE_TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineRoleDataScopeTypeDefinition.comment
    })
    scopeType: TbSkylineRoleDataScopeType

    @Column({
        name: TbSkylineRoleDataScopeColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineRoleDataScopeStatusDefinition.comment
    })
    status: TbSkylineRoleDataScopeStatus
}
