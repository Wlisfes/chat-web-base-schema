import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto } from '@/utils'

export enum TbSrmRouteAppColumn {
    KEY_ID = 'key_id',
    APP_KEY_ID = 'app_key_id',
    USER_KEY_ID = 'user_key_id',
    ROUTE_KEY_ID = 'route_key_id',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export class TbSrmRouteAppDto extends DataBaseByDto {
    @ApiProperty({ description: '短信应用主键：SMS 短信应用主键；一个应用只能绑定一个路由', example: 1001 })
    @Type(() => Number)
    @IsInt({ message: '短信应用必须是整数' })
    @Min(1, { message: '短信应用必须大于0' })
    appKeyId: number

    @ApiProperty({ description: '客户主键：短信应用所属 CRM 客户主键，冗余便于按客户查询', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '客户必须是整数' })
    @Min(1, { message: '客户必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '路由ID：SRM 路由主键', example: 1002001 })
    @Type(() => Number)
    @IsInt({ message: '路由ID必须是整数' })
    @Min(1, { message: '路由ID必须大于0' })
    routeKeyId: number
}

/** 短信应用绑定路由：绑定后路由变为定向路由；未绑定的应用走通用路由。 */
@Index('uk_tb_srm_route_app_app_key_id', ['appKeyId'], { unique: true })
@Index('idx_tb_srm_route_app_user_key_id', ['userKeyId'])
@Index('idx_tb_srm_route_app_route_key_id', ['routeKeyId'])
@Entity({ name: 'tb_srm_route_app', comment: 'SRM 短信应用路由绑定表' })
export class TbSrmRouteApp extends DataBaseByAdapter {
    @Column({ name: TbSrmRouteAppColumn.APP_KEY_ID, type: 'int', nullable: false, comment: '短信应用主键：SMS 短信应用主键' })
    appKeyId: number

    @Column({ name: TbSrmRouteAppColumn.USER_KEY_ID, type: 'int', nullable: false, comment: '客户主键：短信应用所属 CRM 客户主键' })
    userKeyId: number

    @Column({ name: TbSrmRouteAppColumn.ROUTE_KEY_ID, type: 'int', nullable: false, comment: '路由ID：SRM 路由主键' })
    routeKeyId: number
}
