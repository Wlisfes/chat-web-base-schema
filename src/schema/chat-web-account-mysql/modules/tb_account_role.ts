import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_account_role 的数据库字段名。 */
export enum TbAccountRoleColumn {
    KEY_ID = 'key_id',
    UID = 'uid',
    CODE = 'code',
    NAME = 'name',
    DESCRIPTION = 'description',
    SORT = 'sort',
    BUILTIN = 'builtin',
    STATUS = 'status',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 角色状态。 */
export enum TbAccountRoleStatus {
    DISABLED = 'disabled',
    ENABLED = 'enabled'
}

export const TbAccountRoleStatusDefinition = defineEnumMetadata(TbAccountRoleStatus, '角色状态', {
    [TbAccountRoleStatus.DISABLED]: { label: '禁用', description: '角色不参与菜单和数据权限计算' },
    [TbAccountRoleStatus.ENABLED]: { label: '启用', description: '角色正常参与菜单和数据权限计算' }
})

export const {
    metadata: TbAccountRoleStatusMetadata,
    options: TbAccountRoleStatusOptions,
    count: TbAccountRoleStatusCount,
    comment: TbAccountRoleStatusComment
} = TbAccountRoleStatusDefinition

/** 系统角色的完整字段 DTO。 */
export class TbAccountRoleDto extends DataBaseDto {
    @ApiProperty({ description: '角色UID', example: '2149446185344106496' })
    @IsString({ message: '角色UID必须是字符串' })
    @IsNotEmpty({ message: '角色UID必填' })
    @Length(1, 19, { message: '角色UID长度不能超过19位' })
    uid: string

    @ApiProperty({ description: '角色编码', example: 'department_manager' })
    @IsString({ message: '角色编码必须是字符串' })
    @IsNotEmpty({ message: '角色编码必填' })
    @MaxLength(64, { message: '角色编码长度不能超过64位' })
    code: string

    @ApiProperty({ description: '角色名称', example: '部门管理员' })
    @IsString({ message: '角色名称必须是字符串' })
    @IsNotEmpty({ message: '角色名称必填' })
    @MaxLength(64, { message: '角色名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '角色说明', example: '负责本部门及下级部门的账号管理', required: false })
    @IsOptional()
    @IsString({ message: '角色说明必须是字符串' })
    @MaxLength(255, { message: '角色说明长度不能超过255位' })
    description: string

    @ApiProperty({ description: '排序值', example: 10 })
    @IsInt({ message: '排序值必须是整数' })
    @Min(0, { message: '排序值不能小于0' })
    sort: number

    @ApiProperty({ description: '是否为系统内置角色', example: false })
    @IsBoolean({ message: '内置角色标记必须是布尔值' })
    builtin: boolean

    @ApiProperty({
        description: TbAccountRoleStatusComment,
        enum: TbAccountRoleStatus,
        enumName: 'TbAccountRoleStatus',
        example: TbAccountRoleStatus.ENABLED
    })
    @IsEnum(TbAccountRoleStatus, { message: '角色状态格式错误' })
    status: TbAccountRoleStatus
}

@Index('uk_tb_account_role_uid', ['uid'], { unique: true })
@Index('uk_tb_account_role_code', ['code'], { unique: true })
@Index('idx_tb_account_role_status_sort', ['status', 'sort'])
@Entity({ name: 'tb_account_role', comment: '系统角色表' })
export class TbAccountRole extends DataBaseAdapter {
    @Column({ name: TbAccountRoleColumn.UID, type: 'varchar', length: 19, nullable: false, update: false, comment: '角色UID' })
    uid: string

    @Column({ name: TbAccountRoleColumn.CODE, type: 'varchar', length: 64, nullable: false, comment: '角色编码' })
    code: string

    @Column({ name: TbAccountRoleColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '角色名称' })
    name: string

    @Column({ name: TbAccountRoleColumn.DESCRIPTION, type: 'varchar', length: 255, nullable: true, comment: '角色说明' })
    description: string

    @Column({ name: TbAccountRoleColumn.SORT, type: 'int', nullable: false, default: 0, comment: '排序值' })
    sort: number

    @Column({ name: TbAccountRoleColumn.BUILTIN, type: 'boolean', nullable: false, default: false, comment: '是否为系统内置角色' })
    builtin: boolean

    @Column({ name: TbAccountRoleColumn.STATUS, type: 'varchar', length: 32, nullable: false, comment: TbAccountRoleStatusComment })
    status: TbAccountRoleStatus
}
