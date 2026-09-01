import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

export enum TbAccountUserPositionColumn {
    KEY_ID = 'key_id',
    USER_UID = 'user_uid',
    POSITION_KEY_ID = 'position_key_id',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export class TbAccountUserPositionDto extends DataBaseDto {
    @ApiProperty({ description: '账号UID', example: '2149446185344106496' })
    @IsString({ message: '账号UID必须是字符串' })
    @IsNotEmpty({ message: '账号UID必填' })
    @Length(1, 19, { message: '账号UID长度不能超过19位' })
    userUid: string

    @ApiProperty({ description: '职位主键', example: 1 })
    @IsInt({ message: '职位主键必须是整数' })
    @Min(1, { message: '职位主键必须大于0' })
    positionKeyId: number
}

@Index('uk_tb_account_user_position_assignment', ['userUid', 'positionKeyId'], { unique: true })
@Index('idx_tb_account_user_position_position', ['positionKeyId'])
@Entity({ name: 'tb_account_user_position', comment: '员工职位关系表' })
export class TbAccountUserPosition extends DataBaseAdapter {
    @Column({ name: TbAccountUserPositionColumn.USER_UID, type: 'varchar', length: 19, nullable: false, comment: '账号UID' })
    userUid: string

    @Column({ name: TbAccountUserPositionColumn.POSITION_KEY_ID, type: 'int', nullable: false, comment: '职位主键' })
    positionKeyId: number
}
