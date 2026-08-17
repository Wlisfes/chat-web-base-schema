import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_account_user_role 的数据库字段名。 */
export enum TbAccountUserRoleColumn {
    KEY_ID = 'key_id',
    USER_UID = 'user_uid',
    ROLE_KEY_ID = 'role_key_id',
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

    @ApiProperty({ description: '角色主键', example: 1 })
    @IsInt({ message: '角色主键必须是整数' })
    @Min(1, { message: '角色主键必须大于0' })
    roleKeyId: number
}

@Index('uk_tb_account_user_role_assignment', ['userUid', 'roleKeyId'], { unique: true })
@Index('idx_tb_account_user_role_role', ['roleKeyId'])
@Entity({ name: 'tb_account_user_role', comment: '用户角色关系表' })
export class TbAccountUserRole extends DataBaseAdapter {
    @Column({ name: TbAccountUserRoleColumn.USER_UID, type: 'varchar', length: 19, nullable: false, comment: '账号UID' })
    userUid: string

    @Column({ name: TbAccountUserRoleColumn.ROLE_KEY_ID, type: 'int', nullable: false, comment: '角色主键' })
    roleKeyId: number
}
