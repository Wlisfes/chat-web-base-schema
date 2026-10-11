import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_skyline_role_sheet 的数据库字段名。 */
export enum TbSkylineRoleSheetColumn {
    KEY_ID = 'key_id',
    ROLE_KEY_ID = 'role_key_id',
    SHEET_KEY_ID = 'sheet_key_id',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 角色与菜单关系的完整字段 DTO。 */
export class TbSkylineRoleSheetDto extends DataBaseDto {
    @ApiProperty({ description: '角色主键', example: 1 })
    @IsInt({ message: '角色主键必须是整数' })
    @Min(1, { message: '角色主键必须大于0' })
    roleKeyId: number

    @ApiProperty({ description: '菜单主键', example: 1 })
    @IsInt({ message: '菜单主键必须是整数' })
    @Min(1, { message: '菜单主键必须大于0' })
    sheetKeyId: number
}

@Index('uk_tb_skyline_role_sheet_grant', ['roleKeyId', 'sheetKeyId'], { unique: true })
@Index('idx_tb_skyline_role_sheet_sheet', ['sheetKeyId'])
@Entity({ name: 'tb_skyline_role_sheet', comment: '角色菜单权限关系表' })
export class TbSkylineRoleSheet extends DataBaseAdapter {
    @Column({ name: TbSkylineRoleSheetColumn.ROLE_KEY_ID, type: 'int', nullable: false, comment: '角色主键' })
    roleKeyId: number

    @Column({ name: TbSkylineRoleSheetColumn.SHEET_KEY_ID, type: 'int', nullable: false, comment: '菜单主键' })
    sheetKeyId: number
}
