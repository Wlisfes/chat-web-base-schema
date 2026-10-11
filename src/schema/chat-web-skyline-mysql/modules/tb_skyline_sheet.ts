import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_skyline_sheet 的数据库字段名。 */
export enum TbSkylineSheetColumn {
    KEY_ID = 'key_id',
    PARENT_KEY_ID = 'parent_key_id',
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
export enum TbSkylineSheetType {
    DIRECTORY = 'directory',
    MENU = 'menu',
    BUTTON = 'button'
}

export const TbSkylineSheetTypeDefinition = defineEnumMetadata(TbSkylineSheetType, '菜单类型', {
    [TbSkylineSheetType.DIRECTORY]: { label: '目录', description: '只用于组织下级菜单的目录节点', type: 'geekblue' },
    [TbSkylineSheetType.MENU]: { label: '菜单', description: '可导航到页面的菜单节点', type: 'blue' },
    [TbSkylineSheetType.BUTTON]: { label: '按钮', description: '不参与导航、用于绑定后端权限码的操作节点', type: 'cyan' }
})

/** 菜单节点状态。 */
export enum TbSkylineSheetStatus {
    DISABLED = 'disabled',
    ENABLED = 'enabled'
}

export const TbSkylineSheetStatusDefinition = defineEnumMetadata(TbSkylineSheetStatus, '菜单状态', {
    [TbSkylineSheetStatus.DISABLED]: { label: '禁用', description: '菜单及权限码不参与授权计算', type: 'error' },
    [TbSkylineSheetStatus.ENABLED]: { label: '启用', description: '菜单及权限码正常参与授权计算', type: 'success' }
})

/** 菜单显示状态。 */
export enum TbSkylineSheetVisible {
    HIDE = 0,
    SHOW = 1
}

export const TbSkylineSheetVisibleDefinition = defineEnumMetadata(TbSkylineSheetVisible, '菜单显示状态', {
    [TbSkylineSheetVisible.HIDE]: { label: '隐藏', description: '菜单不在前端导航中展示', type: 'default' },
    [TbSkylineSheetVisible.SHOW]: { label: '显示', description: '菜单在前端导航中正常展示', type: 'success' }
})

/** 系统菜单、页面和按钮的完整字段 DTO。 */
export class TbSkylineSheetDto extends DataBaseDto {
    @ApiProperty({ description: '父菜单主键；根节点为空', example: 1, required: false })
    @IsOptional()
    @IsInt({ message: '父菜单主键必须是整数' })
    @Min(1, { message: '父菜单主键必须大于0' })
    parentKeyId: number

    @ApiProperty({ description: TbSkylineSheetTypeDefinition.comment, enum: TbSkylineSheetType, example: TbSkylineSheetType.MENU })
    @IsEnum(TbSkylineSheetType, { message: '菜单类型格式错误' })
    type: TbSkylineSheetType

    @ApiProperty({ description: '菜单名称', example: '用户管理' })
    @IsString({ message: '菜单名称必须是字符串' })
    @IsNotEmpty({ message: '菜单名称必填' })
    @MaxLength(64, { message: '菜单名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '前端路由名称', example: 'SkylineUsers', required: false })
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

    @ApiProperty({ description: '后端权限码', example: 'skyline:user:list', required: false })
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

    @ApiProperty({ description: TbSkylineSheetVisibleDefinition.comment, enum: TbSkylineSheetVisible, example: TbSkylineSheetVisible.SHOW })
    @IsEnum(TbSkylineSheetVisible, { message: '菜单显示状态格式错误' })
    visible: TbSkylineSheetVisible

    @ApiProperty({ description: '页面是否保持缓存', example: false })
    @IsBoolean({ message: '缓存标记必须是布尔值' })
    keepAlive: boolean

    @ApiProperty({ description: TbSkylineSheetStatusDefinition.comment, enum: TbSkylineSheetStatus, example: TbSkylineSheetStatus.ENABLED })
    @IsEnum(TbSkylineSheetStatus, { message: '菜单状态格式错误' })
    status: TbSkylineSheetStatus
}

@Index('uk_tb_skyline_sheet_permission_code', ['permissionCode'], { unique: true })
@Index('idx_tb_skyline_sheet_parent_sort', ['parentKeyId', 'sort'])
@Entity({ name: 'tb_skyline_sheet', comment: '系统菜单与操作权限表' })
export class TbSkylineSheet extends DataBaseAdapter {
    @Column({ name: TbSkylineSheetColumn.PARENT_KEY_ID, type: 'int', nullable: true, comment: '父菜单主键' })
    parentKeyId: number

    @Column({
        name: TbSkylineSheetColumn.TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineSheetTypeDefinition.comment
    })
    type: TbSkylineSheetType

    @Column({ name: TbSkylineSheetColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '菜单名称' })
    name: string

    @Column({ name: TbSkylineSheetColumn.ROUTE_NAME, type: 'varchar', length: 128, nullable: true, comment: '前端路由名称' })
    routeName: string

    @Column({ name: TbSkylineSheetColumn.PATH, type: 'varchar', length: 255, nullable: true, comment: '前端路由路径' })
    path: string

    @Column({ name: TbSkylineSheetColumn.COMPONENT, type: 'varchar', length: 255, nullable: true, comment: '前端组件标识' })
    component: string

    @Column({ name: TbSkylineSheetColumn.PERMISSION_CODE, type: 'varchar', length: 128, nullable: true, comment: '后端权限码' })
    permissionCode: string

    @Column({ name: TbSkylineSheetColumn.ICON, type: 'varchar', length: 128, nullable: true, comment: '图标标识' })
    icon: string

    @Column({ name: TbSkylineSheetColumn.EXTERNAL_URL, type: 'varchar', length: 512, nullable: true, comment: '外部链接地址' })
    externalUrl: string

    @Column({ name: TbSkylineSheetColumn.SORT, type: 'int', nullable: false, default: 0, comment: '同级排序值' })
    sort: number

    @Column({
        name: TbSkylineSheetColumn.VISIBLE,
        type: 'tinyint',
        width: 1,
        nullable: false,
        default: TbSkylineSheetVisible.SHOW,
        comment: TbSkylineSheetVisibleDefinition.comment
    })
    visible: TbSkylineSheetVisible

    @Column({ name: TbSkylineSheetColumn.KEEP_ALIVE, type: 'boolean', nullable: false, default: false, comment: '页面是否保持缓存' })
    keepAlive: boolean

    @Column({
        name: TbSkylineSheetColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineSheetStatusDefinition.comment
    })
    status: TbSkylineSheetStatus
}
