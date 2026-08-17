import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_account_user_role 的数据库字段名。 */
export enum TbAccountUserRoleColumn {
    KEY_ID = 'key_id',
    USER_UID = 'user_uid',
    ROLE_UID = 'role_uid',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 用户与角色关系的完整字段 DTO。 */
export class TbAccountUserRoleDto extends DataBaseDto {
    @ApiProperty({ description: '账号UID', example: '2149446185344106496' })
    @IsString({ message: '账号UID必须是字符串' })
    @IsNotEmpty({ message: '账号UID必填' })
    @Length(1, 19, { message: '账号UID长度不能超过19位' })
    userUid: string

    @ApiProperty({ description: '角色UID', example: '2149446185344106495' })
    @IsString({ message: '角色UID必须是字符串' })
    @IsNotEmpty({ message: '角色UID必填' })
    @Length(1, 19, { message: '角色UID长度不能超过19位' })
    roleUid: string
}

@Index('uk_tb_account_user_role_assignment', ['userUid', 'roleUid'], { unique: true })
@Index('idx_tb_account_user_role_role', ['roleUid'])
@Entity({ name: 'tb_account_user_role', comment: '用户角色关系表' })
export class TbAccountUserRole extends DataBaseAdapter {
    @Column({ name: TbAccountUserRoleColumn.USER_UID, type: 'varchar', length: 19, nullable: false, comment: '账号UID' })
    userUid: string

    @Column({ name: TbAccountUserRoleColumn.ROLE_UID, type: 'varchar', length: 19, nullable: false, comment: '角色UID' })
    roleUid: string
}
