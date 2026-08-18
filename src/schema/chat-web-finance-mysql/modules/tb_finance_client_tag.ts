import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto } from '@/utils'

export enum TbFinanceClientTagColumn {
    KEY_ID = 'key_id',
    CLIENT_KEY_ID = 'client_key_id',
    TAG_NAME = 'tag_name',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export class TbFinanceClientTagDto extends DataBaseByDto {
    @ApiProperty({ description: '客户主键', example: 1 })
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    clientKeyId: number

    @ApiProperty({ description: '标签名称', example: 'VIP' })
    @IsString({ message: '标签名称必须是字符串' })
    @IsNotEmpty({ message: '标签名称必填' })
    @MaxLength(64, { message: '标签名称长度不能超过64位' })
    tagName: string
}

@Index('uk_tb_finance_client_tag_client_name', ['clientKeyId', 'tagName'], { unique: true })
@Index('idx_tb_finance_client_tag_client_key_id', ['clientKeyId'])
@Entity({ name: 'tb_finance_client_tag', comment: '财务客户标签表' })
export class TbFinanceClientTag extends DataBaseByAdapter {
    @Column({ name: TbFinanceClientTagColumn.CLIENT_KEY_ID, type: 'int', nullable: false, comment: '客户主键' })
    clientKeyId: number

    @Column({ name: TbFinanceClientTagColumn.TAG_NAME, type: 'varchar', length: 64, nullable: false, comment: '标签名称' })
    tagName: string
}
