import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_skyline_role 的数据库字段名。 */
export enum TbSkylineRoleColumn {
    KEY_ID = 'key_id',
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
export enum TbSkylineRoleStatus {
    DISABLED = 'disabled',
    ENABLED = 'enabled'
}

export const TbSkylineRoleStatusDefinition = defineEnumMetadata(TbSkylineRoleStatus, '角色状态', {
    [TbSkylineRoleStatus.DISABLED]: { label: '禁用', description: '角色不参与菜单和数据权限计算', type: 'error' },
    [TbSkylineRoleStatus.ENABLED]: { label: '启用', description: '角色正常参与菜单和数据权限计算', type: 'success' }
})

/** 系统角色的完整字段 DTO。 */
export class TbSkylineRoleDto extends DataBaseDto {
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
        description: TbSkylineRoleStatusDefinition.comment,
        enum: TbSkylineRoleStatus,
        enumName: 'TbSkylineRoleStatus',
        example: TbSkylineRoleStatus.ENABLED
    })
    @IsEnum(TbSkylineRoleStatus, { message: '角色状态格式错误' })
    status: TbSkylineRoleStatus
}

@Index('uk_tb_skyline_role_code', ['code'], { unique: true })
@Index('idx_tb_skyline_role_status_sort', ['status', 'sort'])
@Entity({ name: 'tb_skyline_role', comment: '系统角色表' })
export class TbSkylineRole extends DataBaseAdapter {
    @Column({ name: TbSkylineRoleColumn.CODE, type: 'varchar', length: 64, nullable: false, comment: '角色编码' })
    code: string

    @Column({ name: TbSkylineRoleColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '角色名称' })
    name: string

    @Column({ name: TbSkylineRoleColumn.DESCRIPTION, type: 'varchar', length: 255, nullable: true, comment: '角色说明' })
    description: string

    @Column({ name: TbSkylineRoleColumn.SORT, type: 'int', nullable: false, default: 0, comment: '排序值' })
    sort: number

    @Column({ name: TbSkylineRoleColumn.BUILTIN, type: 'boolean', nullable: false, default: false, comment: '是否为系统内置角色' })
    builtin: boolean

    @Column({
        name: TbSkylineRoleColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineRoleStatusDefinition.comment
    })
    status: TbSkylineRoleStatus
}
