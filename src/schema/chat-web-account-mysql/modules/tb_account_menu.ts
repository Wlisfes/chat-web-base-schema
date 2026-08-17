import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_account_menu 的数据库字段名。 */
export enum TbAccountMenuColumn {
    KEY_ID = 'key_id',
    UID = 'uid',
    PARENT_UID = 'parent_uid',
    TYPE = 'type',
    NAME = 'name',
    ROUTE_NAME = 'route_name',
    PATH = 'path',
    COMPONENT = 'component',
    PERMISSION_CODE = 'permission_code',
    ICON = 'icon',
    EXTERNAL_URL = 'external_url',
    SORT = 'sort',
    VISIBLE = 'visible',
    KEEP_ALIVE = 'keep_alive',
    STATUS = 'status',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 菜单节点类型。 */
export enum TbAccountMenuType {
    DIRECTORY = 'directory',
    MENU = 'menu',
    BUTTON = 'button'
}

export const TbAccountMenuTypeDefinition = defineEnumMetadata(TbAccountMenuType, '菜单类型', {
    [TbAccountMenuType.DIRECTORY]: { label: '目录', description: '只用于组织下级菜单的目录节点' },
    [TbAccountMenuType.MENU]: { label: '菜单', description: '可导航到页面的菜单节点' },
    [TbAccountMenuType.BUTTON]: { label: '按钮', description: '不参与导航、用于绑定后端权限码的操作节点' }
})

export const {
    metadata: TbAccountMenuTypeMetadata,
    options: TbAccountMenuTypeOptions,
    count: TbAccountMenuTypeCount,
    comment: TbAccountMenuTypeComment
} = TbAccountMenuTypeDefinition

/** 菜单节点状态。 */
export enum TbAccountMenuStatus {
    DISABLED = 'disabled',
    ENABLED = 'enabled'
}

export const TbAccountMenuStatusDefinition = defineEnumMetadata(TbAccountMenuStatus, '菜单状态', {
    [TbAccountMenuStatus.DISABLED]: { label: '禁用', description: '菜单及权限码不参与授权计算' },
    [TbAccountMenuStatus.ENABLED]: { label: '启用', description: '菜单及权限码正常参与授权计算' }
})

export const {
    metadata: TbAccountMenuStatusMetadata,
    options: TbAccountMenuStatusOptions,
    count: TbAccountMenuStatusCount,
    comment: TbAccountMenuStatusComment
} = TbAccountMenuStatusDefinition

/** 系统菜单、页面和按钮的完整字段 DTO。 */
export class TbAccountMenuDto extends DataBaseDto {
    @ApiProperty({ description: '菜单UID', example: '2149446185344106496' })
    @IsString({ message: '菜单UID必须是字符串' })
    @IsNotEmpty({ message: '菜单UID必填' })
    @Length(1, 19, { message: '菜单UID长度不能超过19位' })
    uid: string

    @ApiProperty({ description: '父菜单UID；根节点为空', example: '2149446185344106495', required: false })
    @IsOptional()
    @IsString({ message: '父菜单UID必须是字符串' })
    @Length(1, 19, { message: '父菜单UID长度不能超过19位' })
    parentUid: string

    @ApiProperty({
        description: TbAccountMenuTypeComment,
        enum: TbAccountMenuType,
        enumName: 'TbAccountMenuType',
        example: TbAccountMenuType.MENU
    })
    @IsEnum(TbAccountMenuType, { message: '菜单类型格式错误' })
    type: TbAccountMenuType

    @ApiProperty({ description: '菜单名称', example: '用户管理' })
    @IsString({ message: '菜单名称必须是字符串' })
    @IsNotEmpty({ message: '菜单名称必填' })
    @MaxLength(64, { message: '菜单名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '前端路由名称', example: 'AccountUsers', required: false })
    @IsOptional()
    @IsString({ message: '路由名称必须是字符串' })
    @MaxLength(128, { message: '路由名称长度不能超过128位' })
    routeName: string

    @ApiProperty({ description: '前端路由路径', example: '/system/users', required: false })
    @IsOptional()
    @IsString({ message: '路由路径必须是字符串' })
    @MaxLength(255, { message: '路由路径长度不能超过255位' })
    path: string

    @ApiProperty({ description: '前端组件标识', example: 'system/users/index', required: false })
    @IsOptional()
    @IsString({ message: '组件标识必须是字符串' })
    @MaxLength(255, { message: '组件标识长度不能超过255位' })
    component: string

    @ApiProperty({ description: '后端权限码', example: 'account:user:list', required: false })
    @IsOptional()
    @IsString({ message: '权限码必须是字符串' })
    @MaxLength(128, { message: '权限码长度不能超过128位' })
    permissionCode: string

    @ApiProperty({ description: '图标标识', example: 'user', required: false })
    @IsOptional()
    @IsString({ message: '图标标识必须是字符串' })
    @MaxLength(128, { message: '图标标识长度不能超过128位' })
    icon: string

    @ApiProperty({ description: '外部链接地址', example: 'https://example.com', required: false })
    @IsOptional()
    @IsString({ message: '外部链接地址必须是字符串' })
    @MaxLength(512, { message: '外部链接地址长度不能超过512位' })
    externalUrl: string

    @ApiProperty({ description: '同级排序值', example: 10 })
    @IsInt({ message: '排序值必须是整数' })
    @Min(0, { message: '排序值不能小于0' })
    sort: number

    @ApiProperty({ description: '是否在导航中显示', example: true })
    @IsBoolean({ message: '显示标记必须是布尔值' })
    visible: boolean

    @ApiProperty({ description: '页面是否保持缓存', example: false })
    @IsBoolean({ message: '缓存标记必须是布尔值' })
    keepAlive: boolean

    @ApiProperty({
        description: TbAccountMenuStatusComment,
        enum: TbAccountMenuStatus,
        enumName: 'TbAccountMenuStatus',
        example: TbAccountMenuStatus.ENABLED
    })
    @IsEnum(TbAccountMenuStatus, { message: '菜单状态格式错误' })
    status: TbAccountMenuStatus
}

@Index('uk_tb_account_menu_uid', ['uid'], { unique: true })
@Index('uk_tb_account_menu_permission_code', ['permissionCode'], { unique: true })
@Index('idx_tb_account_menu_parent_sort', ['parentUid', 'sort'])
@Entity({ name: 'tb_account_menu', comment: '系统菜单与操作权限表' })
export class TbAccountMenu extends DataBaseAdapter {
    @Column({ name: TbAccountMenuColumn.UID, type: 'varchar', length: 19, nullable: false, update: false, comment: '菜单UID' })
    uid: string

    @Column({ name: TbAccountMenuColumn.PARENT_UID, type: 'varchar', length: 19, nullable: true, comment: '父菜单UID' })
    parentUid: string

    @Column({ name: TbAccountMenuColumn.TYPE, type: 'varchar', length: 32, nullable: false, comment: TbAccountMenuTypeComment })
    type: TbAccountMenuType

    @Column({ name: TbAccountMenuColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '菜单名称' })
    name: string

    @Column({ name: TbAccountMenuColumn.ROUTE_NAME, type: 'varchar', length: 128, nullable: true, comment: '前端路由名称' })
    routeName: string

    @Column({ name: TbAccountMenuColumn.PATH, type: 'varchar', length: 255, nullable: true, comment: '前端路由路径' })
    path: string

    @Column({ name: TbAccountMenuColumn.COMPONENT, type: 'varchar', length: 255, nullable: true, comment: '前端组件标识' })
    component: string

    @Column({ name: TbAccountMenuColumn.PERMISSION_CODE, type: 'varchar', length: 128, nullable: true, comment: '后端权限码' })
    permissionCode: string

    @Column({ name: TbAccountMenuColumn.ICON, type: 'varchar', length: 128, nullable: true, comment: '图标标识' })
    icon: string

    @Column({ name: TbAccountMenuColumn.EXTERNAL_URL, type: 'varchar', length: 512, nullable: true, comment: '外部链接地址' })
    externalUrl: string

    @Column({ name: TbAccountMenuColumn.SORT, type: 'int', nullable: false, default: 0, comment: '同级排序值' })
    sort: number

    @Column({ name: TbAccountMenuColumn.VISIBLE, type: 'boolean', nullable: false, default: true, comment: '是否在导航中显示' })
    visible: boolean

    @Column({ name: TbAccountMenuColumn.KEEP_ALIVE, type: 'boolean', nullable: false, default: false, comment: '页面是否保持缓存' })
    keepAlive: boolean

    @Column({ name: TbAccountMenuColumn.STATUS, type: 'varchar', length: 32, nullable: false, comment: TbAccountMenuStatusComment })
    status: TbAccountMenuStatus
}
