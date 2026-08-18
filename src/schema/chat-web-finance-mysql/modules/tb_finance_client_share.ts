import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, Length, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto } from '@/utils'

export enum TbFinanceClientShareColumn {
    KEY_ID = 'key_id',
    CLIENT_KEY_ID = 'client_key_id',
    SHARED_USER_UID = 'shared_user_uid',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export class TbFinanceClientShareDto extends DataBaseByDto {
    @ApiProperty({ description: '客户主键', example: 1 })
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    clientKeyId: number

    @ApiProperty({ description: '共享账号UID', example: '2149446185344106496' })
    @IsString({ message: '共享账号UID必须是字符串' })
    @Length(1, 19, { message: '共享账号UID长度不能超过19位' })
    sharedUserUid: string
}

@Index('uk_tb_finance_client_share_client_user', ['clientKeyId', 'sharedUserUid'], { unique: true })
@Index('idx_tb_finance_client_share_shared_user_uid', ['sharedUserUid'])
@Entity({ name: 'tb_finance_client_share', comment: '财务客户共享表' })
export class TbFinanceClientShare extends DataBaseByAdapter {
    @Column({ name: TbFinanceClientShareColumn.CLIENT_KEY_ID, type: 'int', nullable: false, comment: '客户主键' })
    clientKeyId: number

    @Column({ name: TbFinanceClientShareColumn.SHARED_USER_UID, type: 'varchar', length: 19, nullable: false, comment: '共享账号UID' })
    sharedUserUid: string
}
