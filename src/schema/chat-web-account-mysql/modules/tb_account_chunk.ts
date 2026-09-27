import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_account_chunk 的数据库字段名。 */
export enum TbAccountChunkColumn {
    KEY_ID = 'key_id',
    CHUNK_ID = 'chunk_id',
    LINK_ID = 'link_id',
    LINK_NAME = 'link_name',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 枚举关联类型：<业务表>.<业务字段>，同一业务记录可按类型分别维护多组枚举关联。 */
export enum TbAccountChunkLinkName {
    USER_POST = 'tb_account_user.post',
    USER_LEVEL = 'tb_account_user.level'
}

export const TbAccountChunkLinkNameDefinition = defineEnumMetadata(TbAccountChunkLinkName, '枚举关联类型', {
    [TbAccountChunkLinkName.USER_POST]: {
        label: '账号岗位',
        description: 'link_id 为账号UID，chunk_id 为 Skyline 枚举 CHUNK_SYSTEM_ACCOUNT_USER_POST 主键',
        type: 'info'
    },
    [TbAccountChunkLinkName.USER_LEVEL]: {
        label: '账号职级',
        description: 'link_id 为账号UID，chunk_id 为 Skyline 枚举 CHUNK_SYSTEM_ACCOUNT_USER_LEVEL 主键',
        type: 'purple'
    }
})

/** Account 业务表与 Skyline 枚举关联的完整字段 DTO。 */
export class TbAccountChunkDto extends DataBaseDto {
    @ApiProperty({ description: 'Skyline 枚举主键（tb_skyline_chunk.key_id）', example: 1024100 })
    @IsInt({ message: '枚举主键必须是整数' })
    @Min(1, { message: '枚举主键必须大于0' })
    chunkId: number

    @ApiProperty({ description: '关联业务记录主键（账号UID或业务表主键）', example: '2149446185344106496' })
    @IsString({ message: '关联业务主键必须是字符串' })
    @IsNotEmpty({ message: '关联业务主键必填' })
    @Length(1, 64, { message: '关联业务主键长度不能超过64位' })
    linkId: string

    @ApiProperty({
        description: TbAccountChunkLinkNameDefinition.comment,
        enum: TbAccountChunkLinkName,
        enumName: 'TbAccountChunkLinkName',
        example: TbAccountChunkLinkName.USER_POST
    })
    @IsEnum(TbAccountChunkLinkName, { message: '枚举关联类型格式错误' })
    linkName: TbAccountChunkLinkName
}

@Index('uk_tb_account_chunk_link', ['linkName', 'linkId', 'chunkId'], { unique: true })
@Index('idx_tb_account_chunk_chunk', ['linkName', 'chunkId'])
@Entity({ name: 'tb_account_chunk', comment: '业务枚举关联表' })
export class TbAccountChunk extends DataBaseAdapter {
    @Column({ name: TbAccountChunkColumn.CHUNK_ID, type: 'int', nullable: false, comment: 'Skyline 枚举主键' })
    chunkId: number

    @Column({ name: TbAccountChunkColumn.LINK_ID, type: 'varchar', length: 64, nullable: false, comment: '关联业务记录主键' })
    linkId: string

    @Column({
        name: TbAccountChunkColumn.LINK_NAME,
        type: 'varchar',
        length: 64,
        nullable: false,
        comment: TbAccountChunkLinkNameDefinition.comment
    })
    linkName: TbAccountChunkLinkName
}
