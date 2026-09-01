import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_account_position 的数据库字段名。 */
export enum TbAccountPositionColumn {
    KEY_ID = 'key_id',
    NAME = 'name',
    SORT = 'sort',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 系统职位的完整字段 DTO。 */
export class TbAccountPositionDto extends DataBaseDto {
    @ApiProperty({ description: '职位名称', example: '客户经理' })
    @IsString({ message: '职位名称必须是字符串' })
    @IsNotEmpty({ message: '职位名称必填' })
    @MaxLength(64, { message: '职位名称长度不能超过64位' })
    name: string

    @ApiProperty({ description: '同级排序值', example: 10 })
    @IsInt({ message: '排序值必须是整数' })
    @Min(0, { message: '排序值不能小于0' })
    sort: number
}

@Index('uk_tb_account_position_name', ['name'], { unique: true })
@Index('idx_tb_account_position_sort', ['sort', 'keyId'])
@Entity({ name: 'tb_account_position', comment: '员工职位表' })
export class TbAccountPosition extends DataBaseAdapter {
    @Column({ name: TbAccountPositionColumn.NAME, type: 'varchar', length: 64, nullable: false, comment: '职位名称' })
    name: string

    @Column({ name: TbAccountPositionColumn.SORT, type: 'int', nullable: false, default: 0, comment: '同级排序值' })
    sort: number
}
