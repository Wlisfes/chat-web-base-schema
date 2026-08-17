import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_account_organization_closure 的数据库字段名。 */
export enum TbAccountOrganizationClosureColumn {
    KEY_ID = 'key_id',
    ANCESTOR_UID = 'ancestor_uid',
    DESCENDANT_UID = 'descendant_uid',
    DEPTH = 'depth',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 组织祖先与后代关系的完整字段 DTO。 */
export class TbAccountOrganizationClosureDto extends DataBaseDto {
    @ApiProperty({ description: '祖先组织UID', example: '2149446185344106495' })
    @IsString({ message: '祖先组织UID必须是字符串' })
    @IsNotEmpty({ message: '祖先组织UID必填' })
    @Length(1, 19, { message: '祖先组织UID长度不能超过19位' })
    ancestorUid: string

    @ApiProperty({ description: '后代组织UID', example: '2149446185344106496' })
    @IsString({ message: '后代组织UID必须是字符串' })
    @IsNotEmpty({ message: '后代组织UID必填' })
    @Length(1, 19, { message: '后代组织UID长度不能超过19位' })
    descendantUid: string

    @ApiProperty({ description: '层级距离；节点自身为0', example: 1 })
    @IsInt({ message: '层级距离必须是整数' })
    @Min(0, { message: '层级距离不能小于0' })
    depth: number
}

@Index('uk_tb_account_organization_closure_path', ['ancestorUid', 'descendantUid'], { unique: true })
@Index('idx_tb_account_organization_closure_descendant_depth', ['descendantUid', 'depth'])
@Entity({ name: 'tb_account_organization_closure', comment: '组织层级闭包表' })
export class TbAccountOrganizationClosure extends DataBaseAdapter {
    @Column({ name: TbAccountOrganizationClosureColumn.ANCESTOR_UID, type: 'varchar', length: 19, nullable: false, comment: '祖先组织UID' })
    ancestorUid: string

    @Column({
        name: TbAccountOrganizationClosureColumn.DESCENDANT_UID,
        type: 'varchar',
        length: 19,
        nullable: false,
        comment: '后代组织UID'
    })
    descendantUid: string

    @Column({ name: TbAccountOrganizationClosureColumn.DEPTH, type: 'int', nullable: false, comment: '层级距离；节点自身为0' })
    depth: number
}
