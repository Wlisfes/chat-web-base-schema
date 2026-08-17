import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto } from '@/utils'

/** tb_account_organization_closure 的数据库字段名。 */
export enum TbAccountOrganizationClosureColumn {
    KEY_ID = 'key_id',
    ANCESTOR_KEY_ID = 'ancestor_key_id',
    DESCENDANT_KEY_ID = 'descendant_key_id',
    DEPTH = 'depth',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 组织祖先与后代关系的完整字段 DTO。 */
export class TbAccountOrganizationClosureDto extends DataBaseDto {
    @ApiProperty({ description: '祖先组织主键', example: 1 })
    @IsInt({ message: '祖先组织主键必须是整数' })
    @Min(1, { message: '祖先组织主键必须大于0' })
    ancestorKeyId: number

    @ApiProperty({ description: '后代组织主键', example: 2 })
    @IsInt({ message: '后代组织主键必须是整数' })
    @Min(1, { message: '后代组织主键必须大于0' })
    descendantKeyId: number

    @ApiProperty({ description: '层级距离；节点自身为0', example: 1 })
    @IsInt({ message: '层级距离必须是整数' })
    @Min(0, { message: '层级距离不能小于0' })
    depth: number
}

@Index('uk_tb_account_organization_closure_path', ['ancestorKeyId', 'descendantKeyId'], { unique: true })
@Index('idx_tb_account_organization_closure_descendant_depth', ['descendantKeyId', 'depth'])
@Entity({ name: 'tb_account_organization_closure', comment: '组织层级闭包表' })
export class TbAccountOrganizationClosure extends DataBaseAdapter {
    @Column({ name: TbAccountOrganizationClosureColumn.ANCESTOR_KEY_ID, type: 'int', nullable: false, comment: '祖先组织主键' })
    ancestorKeyId: number

    @Column({
        name: TbAccountOrganizationClosureColumn.DESCENDANT_KEY_ID,
        type: 'int',
        nullable: false,
        comment: '后代组织主键'
    })
    descendantKeyId: number

    @Column({ name: TbAccountOrganizationClosureColumn.DEPTH, type: 'int', nullable: false, comment: '层级距离；节点自身为0' })
    depth: number
}
