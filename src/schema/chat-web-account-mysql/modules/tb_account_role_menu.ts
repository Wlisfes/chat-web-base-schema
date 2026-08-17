import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_account_role_menu 的数据库字段名。 */
export enum TbAccountRoleMenuColumn {
    KEY_ID = 'key_id',
    ROLE_UID = 'role_uid',
    MENU_UID = 'menu_uid',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 角色与菜单关系的完整字段 DTO。 */
export class TbAccountRoleMenuDto extends DataBaseDto {
    @ApiProperty({ description: '角色UID', example: '2149446185344106496' })
    @IsString({ message: '角色UID必须是字符串' })
    @IsNotEmpty({ message: '角色UID必填' })
    @Length(1, 19, { message: '角色UID长度不能超过19位' })
    roleUid: string

    @ApiProperty({ description: '菜单UID', example: '2149446185344106495' })
    @IsString({ message: '菜单UID必须是字符串' })
    @IsNotEmpty({ message: '菜单UID必填' })
    @Length(1, 19, { message: '菜单UID长度不能超过19位' })
    menuUid: string
}

@Index('uk_tb_account_role_menu_grant', ['roleUid', 'menuUid'], { unique: true })
@Index('idx_tb_account_role_menu_menu', ['menuUid'])
@Entity({ name: 'tb_account_role_menu', comment: '角色菜单权限关系表' })
export class TbAccountRoleMenu extends DataBaseAdapter {
    @Column({ name: TbAccountRoleMenuColumn.ROLE_UID, type: 'varchar', length: 19, nullable: false, comment: '角色UID' })
    roleUid: string

    @Column({ name: TbAccountRoleMenuColumn.MENU_UID, type: 'varchar', length: 19, nullable: false, comment: '菜单UID' })
    menuUid: string
}
