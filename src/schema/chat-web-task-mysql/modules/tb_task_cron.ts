import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, DateWithColumn, WithJsonColumn, defineEnumMetadata } from '@/utils'

/** tb_task_cron 的数据库字段名。 */
export enum TbTaskCronColumn {
    KEY_ID = 'key_id',
    TASK_ID = 'task_id',
    TASK_NAME = 'task_name',
    MODULE = 'module',
    HANDLER = 'handler',
    COMMENT = 'comment',
    CRON = 'cron',
    STATUS = 'status',
    BODY = 'body',
    MAX_ATTEMPTS = 'max_attempts',
    LAST_TIME = 'last_time',
    NEXT_TIME = 'next_time',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 任务所属模块，按任务服务的业务归属划分，用于管理端分组筛选。 */
export enum TbTaskCronModule {
    TASK_SYSTEM = 'TASK_SYSTEM',
    TASK_FINANCE = 'TASK_FINANCE',
    TASK_CRM = 'TASK_CRM'
}

export const TbTaskCronModuleDefinition = defineEnumMetadata(TbTaskCronModule, '任务所属模块', {
    [TbTaskCronModule.TASK_SYSTEM]: { label: '系统', description: '系统管理模块的任务', type: 'geekblue' },
    [TbTaskCronModule.TASK_FINANCE]: { label: '财务', description: '财务模块的任务，如汇率同步', type: 'orange' },
    [TbTaskCronModule.TASK_CRM]: { label: 'CRM', description: 'CRM 客户关系管理模块的任务', type: 'blue' }
})

/** 周期任务状态。 */
export enum TbTaskCronStatus {
    DISABLE = 'disable',
    ENABLE = 'enable'
}

export const TbTaskCronStatusDefinition = defineEnumMetadata(TbTaskCronStatus, '任务状态', {
    [TbTaskCronStatus.ENABLE]: { label: '启用', description: '按照 Cron 表达式参与调度', type: 'success' },
    [TbTaskCronStatus.DISABLE]: { label: '停用', description: '不参与调度，可手动触发', type: 'default' }
})

/** 周期任务完整字段 DTO。 */
export class TbTaskCronDto extends DataBaseByDto {
    @ApiProperty({ description: '任务ID，系统内唯一的19位数字字符串', example: '2149446185344106496' })
    @IsString({ message: '任务ID必须是字符串' })
    @IsNotEmpty({ message: '任务ID必填' })
    @Length(1, 19, { message: '任务ID长度不能超过19位' })
    @Matches(/^\d{1,19}$/, { message: '任务ID必须是1至19位数字字符串' })
    taskId: string

    @ApiProperty({ description: '任务名称', example: '汇率同步定时任务' })
    @IsString({ message: '任务名称必须是字符串' })
    @IsNotEmpty({ message: '任务名称必填' })
    @MaxLength(128, { message: '任务名称长度不能超过128位' })
    taskName: string

    @ApiProperty({
        description: TbTaskCronModuleDefinition.comment,
        enum: TbTaskCronModule,
        enumName: 'TbTaskCronModule',
        example: TbTaskCronModule.TASK_FINANCE
    })
    @IsEnum(TbTaskCronModule, { message: '任务所属模块格式错误' })
    module: TbTaskCronModule

    @ApiProperty({ description: '处理器标识，对应 task 服务中注册的任务处理器', example: 'datetask-sync-exchange-rate' })
    @IsString({ message: '处理器标识必须是字符串' })
    @IsNotEmpty({ message: '处理器标识必填' })
    @MaxLength(64, { message: '处理器标识长度不能超过64位' })
    handler: string

    @ApiProperty({ description: '任务描述', example: '每天触发 Finance 服务拉取汇率并写入财务数据库', required: false })
    @IsOptional()
    @IsString({ message: '任务描述必须是字符串' })
    @MaxLength(256, { message: '任务描述长度不能超过256位' })
    comment: string

    @ApiProperty({ description: 'Cron 表达式（秒 分 时 日 月 周）', example: '0 0 8 * * *' })
    @IsString({ message: 'Cron表达式必须是字符串' })
    @IsNotEmpty({ message: 'Cron表达式必填' })
    @MaxLength(32, { message: 'Cron表达式长度不能超过32位' })
    cron: string

    @ApiProperty({
        description: TbTaskCronStatusDefinition.comment,
        enum: TbTaskCronStatus,
        enumName: 'TbTaskCronStatus',
        example: TbTaskCronStatus.ENABLE
    })
    @IsEnum(TbTaskCronStatus, { message: '任务状态格式错误' })
    status: TbTaskCronStatus

    @ApiProperty({ description: '任务参数，每次执行原样传给处理器', type: Object, example: { base: 'USD' }, required: false })
    @IsOptional()
    @IsObject({ message: '任务参数必须是对象' })
    body: Record<string, unknown>

    @ApiProperty({ description: '单次执行最大尝试次数（含首次），超过后执行记录标记为失败', example: 8 })
    @Type(() => Number)
    @IsInt({ message: '最大尝试次数必须是整数' })
    @Min(1, { message: '最大尝试次数不能小于1' })
    @Max(20, { message: '最大尝试次数不能超过20' })
    maxAttempts: number

    @ApiProperty({ description: '上次执行时间', format: 'date-time', example: '2026-10-12 08:00:00.000', required: false })
    @IsOptional()
    lastTime: Date

    @ApiProperty({ description: '下次执行时间', format: 'date-time', example: '2026-10-13 08:00:00.000', required: false })
    @IsOptional()
    nextTime: Date
}

@Index('uk_tb_task_cron_task_id', ['taskId'], { unique: true })
@Index('uk_tb_task_cron_task_name', ['taskName'], { unique: true })
@Index('idx_tb_task_cron_module', ['module'])
@Index('idx_tb_task_cron_status', ['status'])
@Entity({ name: 'tb_task_cron', comment: 'Task 周期任务表' })
export class TbTaskCron extends DataBaseByAdapter {
    @Column({ name: TbTaskCronColumn.TASK_ID, type: 'varchar', length: 19, nullable: false, update: false, comment: '任务ID' })
    taskId: string

    @Column({ name: TbTaskCronColumn.TASK_NAME, type: 'varchar', length: 128, nullable: false, comment: '任务名称' })
    taskName: string

    @Column({ name: TbTaskCronColumn.MODULE, type: 'varchar', length: 32, nullable: false, comment: TbTaskCronModuleDefinition.comment })
    module: TbTaskCronModule

    @Column({ name: TbTaskCronColumn.HANDLER, type: 'varchar', length: 64, nullable: false, comment: '处理器标识' })
    handler: string

    @Column({ name: TbTaskCronColumn.COMMENT, type: 'varchar', length: 256, nullable: true, comment: '任务描述' })
    comment: string

    @Column({ name: TbTaskCronColumn.CRON, type: 'varchar', length: 32, nullable: false, comment: 'Cron 表达式' })
    cron: string

    @Column({ name: TbTaskCronColumn.STATUS, type: 'varchar', length: 32, nullable: false, comment: TbTaskCronStatusDefinition.comment })
    status: TbTaskCronStatus

    @WithJsonColumn({ name: TbTaskCronColumn.BODY, nullable: true, comment: '任务参数' })
    body: Record<string, unknown>

    @Column({ name: TbTaskCronColumn.MAX_ATTEMPTS, type: 'int', nullable: false, default: 8, comment: '单次执行最大尝试次数（含首次）' })
    maxAttempts: number

    @DateWithColumn(Column, { name: TbTaskCronColumn.LAST_TIME, type: 'datetime', precision: 3, nullable: true, comment: '上次执行时间' })
    lastTime: Date

    @DateWithColumn(Column, { name: TbTaskCronColumn.NEXT_TIME, type: 'datetime', precision: 3, nullable: true, comment: '下次执行时间' })
    nextTime: Date
}
