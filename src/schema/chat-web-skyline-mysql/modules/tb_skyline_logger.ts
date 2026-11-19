import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

/** tb_skyline_logger 的数据库字段名。 */
export enum TbSkylineLoggerColumn {
    KEY_ID = 'key_id',
    LOG_ID = 'log_id',
    SERVICE_NAME = 'service_name',
    PERMISSION_CODE = 'permission_code',
    SHEET_KEY_ID = 'sheet_key_id',
    SHEET_NAME = 'sheet_name',
    RESOURCE_TYPE = 'resource_type',
    RESOURCE_ID = 'resource_id',
    OPERATOR_UID = 'operator_uid',
    OPERATOR_NUMBER = 'operator_number',
    OPERATOR_NAME = 'operator_name',
    METHOD = 'method',
    URL = 'url',
    IP = 'ip',
    RESULT = 'result',
    MESSAGE = 'message',
    REQUEST_BODY = 'request_body',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 操作结果。 */
export enum TbSkylineLoggerResult {
    SUCCESS = 'success',
    FAILURE = 'failure'
}

export const TbSkylineLoggerResultDefinition = defineEnumMetadata(TbSkylineLoggerResult, '操作结果', {
    [TbSkylineLoggerResult.SUCCESS]: { label: '成功', description: '接口执行成功', type: 'success' },
    [TbSkylineLoggerResult.FAILURE]: { label: '失败', description: '接口执行失败', type: 'error' }
})

/** 系统日志的完整字段 DTO。 */
export class TbSkylineLoggerDto extends DataBaseDto {
    @ApiProperty({ description: '请求日志号', example: '34ec4ca9-2abf-49b8-85f6-77d7fd23ea1d' })
    @IsString({ message: '请求日志号必须是字符串' })
    @IsNotEmpty({ message: '请求日志号必填' })
    @MaxLength(64, { message: '请求日志号长度不能超过64位' })
    logId: string

    @ApiProperty({ description: '产生操作的服务名', example: 'chat-web-skyline-service' })
    @IsString({ message: '服务名必须是字符串' })
    @IsNotEmpty({ message: '服务名必填' })
    @MaxLength(64, { message: '服务名长度不能超过64位' })
    serviceName: string

    @ApiProperty({ description: '操作权限码', example: 'chat:deploy:system:sheet:create' })
    @IsString({ message: '操作权限码必须是字符串' })
    @IsNotEmpty({ message: '操作权限码必填' })
    @MaxLength(128, { message: '操作权限码长度不能超过128位' })
    permissionCode: string

    @ApiProperty({ description: '写入时解析到的菜单节点主键', example: 1, required: false })
    @IsOptional()
    @IsInt({ message: '菜单节点主键必须是整数' })
    @Min(1, { message: '菜单节点主键必须大于0' })
    sheetKeyId: number

    @ApiProperty({ description: '写入时的菜单名称快照', example: '新增菜单', required: false })
    @IsOptional()
    @IsString({ message: '菜单名称必须是字符串' })
    @MaxLength(64, { message: '菜单名称长度不能超过64位' })
    sheetName: string

    @ApiProperty({ description: '业务对象类型', example: 'sheet', required: false })
    @IsOptional()
    @IsString({ message: '业务对象类型必须是字符串' })
    @MaxLength(64, { message: '业务对象类型长度不能超过64位' })
    resourceType: string

    @ApiProperty({ description: '业务对象主键或业务编号', example: '1024', required: false })
    @IsOptional()
    @IsString({ message: '业务对象标识必须是字符串' })
    @MaxLength(64, { message: '业务对象标识长度不能超过64位' })
    resourceId: string

    @ApiProperty({ description: '操作人账号UID', example: '2149446185344106496', required: false })
    @IsOptional()
    @IsString({ message: '操作人账号UID必须是字符串' })
    @MaxLength(19, { message: '操作人账号UID长度不能超过19位' })
    operatorUid: string

    @ApiProperty({ description: '操作人工号', example: '1234', required: false })
    @IsOptional()
    @IsString({ message: '操作人工号必须是字符串' })
    @MaxLength(32, { message: '操作人工号长度不能超过32位' })
    operatorNumber: string

    @ApiProperty({ description: '操作人姓名', example: '张三', required: false })
    @IsOptional()
    @IsString({ message: '操作人姓名必须是字符串' })
    @MaxLength(64, { message: '操作人姓名长度不能超过64位' })
    operatorName: string

    @ApiProperty({ description: 'HTTP 方法', example: 'POST' })
    @IsString({ message: 'HTTP 方法必须是字符串' })
    @IsNotEmpty({ message: 'HTTP 方法必填' })
    @MaxLength(16, { message: 'HTTP 方法长度不能超过16位' })
    method: string

    @ApiProperty({ description: '请求路径', example: '/deploy/sheet/create' })
    @IsString({ message: '请求路径必须是字符串' })
    @IsNotEmpty({ message: '请求路径必填' })
    @MaxLength(512, { message: '请求路径长度不能超过512位' })
    url: string

    @ApiProperty({ description: '客户端 IP', example: '127.0.0.1', required: false })
    @IsOptional()
    @IsString({ message: '客户端 IP必须是字符串' })
    @MaxLength(64, { message: '客户端 IP长度不能超过64位' })
    ip: string

    @ApiProperty({
        description: TbSkylineLoggerResultDefinition.comment,
        enum: TbSkylineLoggerResult,
        example: TbSkylineLoggerResult.SUCCESS
    })
    @IsEnum(TbSkylineLoggerResult, { message: '操作结果格式错误' })
    result: TbSkylineLoggerResult

    @ApiProperty({ description: '失败原因或结果说明', example: '菜单名称已存在', required: false })
    @IsOptional()
    @IsString({ message: '结果说明必须是字符串' })
    @MaxLength(255, { message: '结果说明长度不能超过255位' })
    message: string

    @ApiProperty({ description: '脱敏并截断后的请求体', example: '{"name":"菜单"}', required: false })
    @IsOptional()
    @IsString({ message: '请求体必须是字符串' })
    requestBody: string
}

@Index('idx_tb_skyline_logger_permission_time', ['permissionCode', 'createTime'])
@Index('idx_tb_skyline_logger_sheet_time', ['sheetKeyId', 'createTime'])
@Index('idx_tb_skyline_logger_operator_time', ['operatorUid', 'createTime'])
@Index('idx_tb_skyline_logger_resource', ['resourceType', 'resourceId'])
@Entity({ name: 'tb_skyline_logger', comment: '系统日志表' })
export class TbSkylineLogger extends DataBaseAdapter {
    @Column({ name: TbSkylineLoggerColumn.LOG_ID, type: 'varchar', length: 64, nullable: false, comment: '请求日志号' })
    logId: string

    @Column({ name: TbSkylineLoggerColumn.SERVICE_NAME, type: 'varchar', length: 64, nullable: false, comment: '产生操作的服务名' })
    serviceName: string

    @Column({
        name: TbSkylineLoggerColumn.PERMISSION_CODE,
        type: 'varchar',
        length: 128,
        nullable: false,
        comment: '操作权限码'
    })
    permissionCode: string

    @Column({ name: TbSkylineLoggerColumn.SHEET_KEY_ID, type: 'int', nullable: true, comment: '写入时解析到的菜单节点主键' })
    sheetKeyId: number

    @Column({ name: TbSkylineLoggerColumn.SHEET_NAME, type: 'varchar', length: 64, nullable: true, comment: '写入时的菜单名称快照' })
    sheetName: string

    @Column({ name: TbSkylineLoggerColumn.RESOURCE_TYPE, type: 'varchar', length: 64, nullable: true, comment: '业务对象类型' })
    resourceType: string

    @Column({ name: TbSkylineLoggerColumn.RESOURCE_ID, type: 'varchar', length: 64, nullable: true, comment: '业务对象主键或业务编号' })
    resourceId: string

    @Column({ name: TbSkylineLoggerColumn.OPERATOR_UID, type: 'varchar', length: 19, nullable: true, comment: '操作人账号UID' })
    operatorUid: string

    @Column({ name: TbSkylineLoggerColumn.OPERATOR_NUMBER, type: 'varchar', length: 32, nullable: true, comment: '操作人工号' })
    operatorNumber: string

    @Column({ name: TbSkylineLoggerColumn.OPERATOR_NAME, type: 'varchar', length: 64, nullable: true, comment: '操作人姓名' })
    operatorName: string

    @Column({ name: TbSkylineLoggerColumn.METHOD, type: 'varchar', length: 16, nullable: false, comment: 'HTTP 方法' })
    method: string

    @Column({ name: TbSkylineLoggerColumn.URL, type: 'varchar', length: 512, nullable: false, comment: '请求路径' })
    url: string

    @Column({ name: TbSkylineLoggerColumn.IP, type: 'varchar', length: 64, nullable: true, comment: '客户端 IP' })
    ip: string

    @Column({
        name: TbSkylineLoggerColumn.RESULT,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineLoggerResultDefinition.comment
    })
    result: TbSkylineLoggerResult

    @Column({ name: TbSkylineLoggerColumn.MESSAGE, type: 'varchar', length: 255, nullable: true, comment: '失败原因或结果说明' })
    message: string

    @Column({ name: TbSkylineLoggerColumn.REQUEST_BODY, type: 'text', nullable: true, comment: '脱敏并截断后的请求体' })
    requestBody: string
}
