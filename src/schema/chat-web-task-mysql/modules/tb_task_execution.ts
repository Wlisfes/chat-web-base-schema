import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Length, Matches, MaxLength, Min } from 'class-validator'
import { DataBaseByAdapter, DataBaseByDto, DateWithColumn, WithJsonColumn, defineEnumMetadata } from '@/utils'

/** tb_task_execution 的数据库字段名。 */
export enum TbTaskExecutionColumn {
    KEY_ID = 'key_id',
    EXECUTION_ID = 'execution_id',
    TASK_ID = 'task_id',
    TASK_NAME = 'task_name',
    HANDLER = 'handler',
    BIZ_KEY = 'biz_key',
    TRIGGER_TYPE = 'trigger_type',
    STATUS = 'status',
    BODY = 'body',
    ATTEMPTS = 'attempts',
    MAX_ATTEMPTS = 'max_attempts',
    SCHEDULED_TIME = 'scheduled_time',
    PUBLISH_TIME = 'publish_time',
    NEXT_RETRY_TIME = 'next_retry_time',
    START_TIME = 'start_time',
    END_TIME = 'end_time',
    DURATION = 'duration',
    RESULT = 'result',
    ERROR = 'error',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 执行记录状态。 */
export enum TbTaskExecutionStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    RETRYING = 'retrying',
    SUCCESS = 'success',
    FAILED = 'failed'
}

export const TbTaskExecutionStatusDefinition = defineEnumMetadata(TbTaskExecutionStatus, '执行状态', {
    [TbTaskExecutionStatus.PENDING]: { label: '待执行', description: '已生成执行记录，等待投递或消费', type: 'default' },
    [TbTaskExecutionStatus.RUNNING]: { label: '执行中', description: '执行器正在处理', type: 'info' },
    [TbTaskExecutionStatus.RETRYING]: { label: '等待重试', description: '上次尝试失败，等待下次重试', type: 'warning' },
    [TbTaskExecutionStatus.SUCCESS]: { label: '执行成功', description: '任务执行成功', type: 'success' },
    [TbTaskExecutionStatus.FAILED]: { label: '执行失败', description: '超过最大尝试次数或遇到不可重试错误', type: 'error' }
})

/** 执行触发方式。 */
export enum TbTaskExecutionTrigger {
    SYSTEM = 'system',
    MANUAL = 'manual'
}

export const TbTaskExecutionTriggerDefinition = defineEnumMetadata(TbTaskExecutionTrigger, '触发方式', {
    [TbTaskExecutionTrigger.SYSTEM]: { label: '系统执行', description: '按照 Cron 表达式由系统自动调度执行', type: 'geekblue' },
    [TbTaskExecutionTrigger.MANUAL]: { label: '手动执行', description: '由管理员在管理端手动触发执行', type: 'orange' }
})

/** 执行记录完整字段 DTO。 */
export class TbTaskExecutionDto extends DataBaseByDto {
    @ApiProperty({ description: '执行记录ID，系统内唯一的19位数字字符串', example: '2150123456789012345' })
    @IsString({ message: '执行记录ID必须是字符串' })
    @IsNotEmpty({ message: '执行记录ID必填' })
    @Length(1, 19, { message: '执行记录ID长度不能超过19位' })
    @Matches(/^\d{1,19}$/, { message: '执行记录ID必须是1至19位数字字符串' })
    executionId: string

    @ApiProperty({ description: '任务ID', example: '2149446185344106496' })
    @IsString({ message: '任务ID必须是字符串' })
    @IsNotEmpty({ message: '任务ID必填' })
    @Length(1, 19, { message: '任务ID长度不能超过19位' })
    @Matches(/^\d{1,19}$/, { message: '任务ID必须是1至19位数字字符串' })
    taskId: string

    @ApiProperty({ description: '任务名称（触发时快照）', example: '汇率同步定时任务' })
    @IsString({ message: '任务名称必须是字符串' })
    @IsNotEmpty({ message: '任务名称必填' })
    @MaxLength(128, { message: '任务名称长度不能超过128位' })
    taskName: string

    @ApiProperty({ description: '处理器标识（触发时快照）', example: 'datetask-sync-exchange-rate' })
    @IsString({ message: '处理器标识必须是字符串' })
    @IsNotEmpty({ message: '处理器标识必填' })
    @MaxLength(64, { message: '处理器标识长度不能超过64位' })
    handler: string

    @ApiProperty({
        description: '业务幂等键，同一键只生成一条执行记录；系统调度为“任务ID:计划时间”，手动触发为“任务ID:manual:执行记录ID”',
        example: '2149446185344106496:20261012080000'
    })
    @IsString({ message: '业务键必须是字符串' })
    @IsNotEmpty({ message: '业务键必填' })
    @MaxLength(128, { message: '业务键长度不能超过128位' })
    bizKey: string

    @ApiProperty({
        description: TbTaskExecutionTriggerDefinition.comment,
        enum: TbTaskExecutionTrigger,
        enumName: 'TbTaskExecutionTrigger',
        example: TbTaskExecutionTrigger.SYSTEM
    })
    @IsEnum(TbTaskExecutionTrigger, { message: '触发方式格式错误' })
    triggerType: TbTaskExecutionTrigger

    @ApiProperty({
        description: TbTaskExecutionStatusDefinition.comment,
        enum: TbTaskExecutionStatus,
        enumName: 'TbTaskExecutionStatus',
        example: TbTaskExecutionStatus.SUCCESS
    })
    @IsEnum(TbTaskExecutionStatus, { message: '执行状态格式错误' })
    status: TbTaskExecutionStatus

    @ApiProperty({ description: '任务参数（触发时快照）', type: Object, example: { base: 'USD' }, required: false })
    @IsOptional()
    @IsObject({ message: '任务参数必须是对象' })
    body: Record<string, unknown>

    @ApiProperty({ description: '已尝试次数', example: 1 })
    @Type(() => Number)
    @IsInt({ message: '已尝试次数必须是整数' })
    @Min(0, { message: '已尝试次数不能小于0' })
    attempts: number

    @ApiProperty({ description: '最大尝试次数（触发时快照，含首次）', example: 8 })
    @Type(() => Number)
    @IsInt({ message: '最大尝试次数必须是整数' })
    @Min(1, { message: '最大尝试次数不能小于1' })
    maxAttempts: number

    @ApiProperty({ description: '计划执行时间；手动触发为提交时间', format: 'date-time', example: '2026-10-12 08:00:00.000' })
    @IsNotEmpty({ message: '计划执行时间必填' })
    scheduledTime: Date

    @ApiProperty({
        description: '最近一次投递到消息队列的时间；为空表示尚未投递成功',
        format: 'date-time',
        example: '2026-10-12 08:00:00.050',
        required: false
    })
    @IsOptional()
    publishTime: Date

    @ApiProperty({ description: '下次重试时间', format: 'date-time', example: '2026-10-12 08:05:00.000', required: false })
    @IsOptional()
    nextRetryTime: Date

    @ApiProperty({ description: '首次开始执行时间', format: 'date-time', example: '2026-10-12 08:00:00.120', required: false })
    @IsOptional()
    startTime: Date

    @ApiProperty({ description: '最终结束时间', format: 'date-time', example: '2026-10-12 08:00:01.370', required: false })
    @IsOptional()
    endTime: Date

    @ApiProperty({ description: '最后一次尝试耗时（毫秒）', example: 1250 })
    @Type(() => Number)
    @IsInt({ message: '执行耗时必须是整数' })
    @Min(0, { message: '执行耗时不能小于0' })
    duration: number

    @ApiProperty({ description: '执行结果摘要，不保存业务明细', type: Object, example: { date: '2026-10-12', count: 30 }, required: false })
    @IsOptional()
    @IsObject({ message: '执行结果必须是对象' })
    result: Record<string, unknown>

    @ApiProperty({ description: '最后一次失败原因', example: 'Finance 服务请求超时', required: false })
    @IsOptional()
    @IsString({ message: '失败原因必须是字符串' })
    @MaxLength(1024, { message: '失败原因长度不能超过1024位' })
    error: string
}

@Index('uk_tb_task_execution_execution_id', ['executionId'], { unique: true })
@Index('uk_tb_task_execution_biz_key', ['bizKey'], { unique: true })
@Index('idx_tb_task_execution_task_id_scheduled_time', ['taskId', 'scheduledTime'])
@Index('idx_tb_task_execution_status_next_retry_time', ['status', 'nextRetryTime'])
@Entity({ name: 'tb_task_execution', comment: 'Task 任务执行记录表' })
export class TbTaskExecution extends DataBaseByAdapter {
    @Column({
        name: TbTaskExecutionColumn.EXECUTION_ID,
        type: 'varchar',
        length: 19,
        nullable: false,
        update: false,
        comment: '执行记录ID'
    })
    executionId: string

    @Column({ name: TbTaskExecutionColumn.TASK_ID, type: 'varchar', length: 19, nullable: false, update: false, comment: '任务ID' })
    taskId: string

    @Column({ name: TbTaskExecutionColumn.TASK_NAME, type: 'varchar', length: 128, nullable: false, comment: '任务名称' })
    taskName: string

    @Column({ name: TbTaskExecutionColumn.HANDLER, type: 'varchar', length: 64, nullable: false, update: false, comment: '处理器标识' })
    handler: string

    @Column({ name: TbTaskExecutionColumn.BIZ_KEY, type: 'varchar', length: 128, nullable: false, update: false, comment: '业务幂等键' })
    bizKey: string

    @Column({
        name: TbTaskExecutionColumn.TRIGGER_TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        update: false,
        comment: TbTaskExecutionTriggerDefinition.comment
    })
    triggerType: TbTaskExecutionTrigger

    @Column({
        name: TbTaskExecutionColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbTaskExecutionStatusDefinition.comment
    })
    status: TbTaskExecutionStatus

    @WithJsonColumn({ name: TbTaskExecutionColumn.BODY, nullable: true, comment: '任务参数' })
    body: Record<string, unknown>

    @Column({ name: TbTaskExecutionColumn.ATTEMPTS, type: 'int', nullable: false, default: 0, comment: '已尝试次数' })
    attempts: number

    @Column({ name: TbTaskExecutionColumn.MAX_ATTEMPTS, type: 'int', nullable: false, comment: '最大尝试次数（含首次）' })
    maxAttempts: number

    @DateWithColumn(Column, {
        name: TbTaskExecutionColumn.SCHEDULED_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '计划执行时间',
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    })
    scheduledTime: Date

    @DateWithColumn(Column, {
        name: TbTaskExecutionColumn.PUBLISH_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '最近投递时间',
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    })
    publishTime: Date

    @DateWithColumn(Column, {
        name: TbTaskExecutionColumn.NEXT_RETRY_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '下次重试时间',
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    })
    nextRetryTime: Date

    @DateWithColumn(Column, {
        name: TbTaskExecutionColumn.START_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '首次开始执行时间',
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    })
    startTime: Date

    @DateWithColumn(Column, {
        name: TbTaskExecutionColumn.END_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '最终结束时间',
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    })
    endTime: Date

    @Column({ name: TbTaskExecutionColumn.DURATION, type: 'int', nullable: false, default: 0, comment: '最后一次尝试耗时（毫秒）' })
    duration: number

    @WithJsonColumn({ name: TbTaskExecutionColumn.RESULT, nullable: true, comment: '执行结果摘要' })
    result: Record<string, unknown>

    @Column({ name: TbTaskExecutionColumn.ERROR, type: 'varchar', length: 1024, nullable: true, comment: '最后一次失败原因' })
    error: string
}
