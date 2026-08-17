import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_account_role_menu 的数据库字段名。 */
export enum TbAccountRoleMenuColumn {
    KEY_ID = 'key_id',
    ROLE_KEY_ID = 'role_key_id',
    MENU_KEY_ID = 'menu_key_id',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 角色与菜单关系的完整字段 DTO。 */
export class TbAccountRoleMenuDto extends DataBaseDto {
    @ApiProperty({ description: '角色主键', example: 1 })
    @IsInt({ message: '角色主键必须是整数' })
    @Min(1, { message: '角色主键必须大于0' })
    roleKeyId: number

    @ApiProperty({ description: '菜单主键', example: 1 })
    @IsInt({ message: '菜单主键必须是整数' })
    @Min(1, { message: '菜单主键必须大于0' })
    menuKeyId: number
}

@Index('uk_tb_account_role_menu_grant', ['roleKeyId', 'menuKeyId'], { unique: true })
@Index('idx_tb_account_role_menu_menu', ['menuKeyId'])
@Entity({ name: 'tb_account_role_menu', comment: '角色菜单权限关系表' })
export class TbAccountRoleMenu extends DataBaseAdapter {
    @Column({ name: TbAccountRoleMenuColumn.ROLE_KEY_ID, type: 'int', nullable: false, comment: '角色主键' })
    roleKeyId: number

    @Column({ name: TbAccountRoleMenuColumn.MENU_KEY_ID, type: 'int', nullable: false, comment: '菜单主键' })
    menuKeyId: number
}
