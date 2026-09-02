import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, Length, MaxLength } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, DateWithColumn, WithJsonColumn, defineEnumMetadata } from '@/utils'

/** tb_skyline_datetask_system 的数据库字段名。 */
export enum TbSkylineDatetaskSystemColumn {
    KEY_ID = 'key_id',
    TASK_ID = 'task_id',
    TASK_NAME = 'task_name',
    HANDLER = 'handler',
    COMMENT = 'comment',
    CRON = 'cron',
    TYPE = 'type',
    STATUS = 'status',
    BODY = 'body',
    LAST_TIME = 'last_time',
    NEXT_TIME = 'next_time',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 系统任务类型。 */
export enum TbSkylineDatetaskSystemType {
    CRON = 'cron',
    MANUAL = 'manual',
    SYSTEM = 'system'
}

export const TbSkylineDatetaskSystemTypeDefinition = defineEnumMetadata(TbSkylineDatetaskSystemType, '任务类型', {
    [TbSkylineDatetaskSystemType.CRON]: { label: '周期任务', description: '按照 Cron 表达式周期执行的任务' },
    [TbSkylineDatetaskSystemType.MANUAL]: { label: '手动任务', description: '仅由人工操作触发的任务' },
    [TbSkylineDatetaskSystemType.SYSTEM]: { label: '系统任务', description: '系统内置且不可删除的任务' }
})

export const {
    metadata: TbSkylineDatetaskSystemTypeMetadata,
    options: TbSkylineDatetaskSystemTypeOptions,
    count: TbSkylineDatetaskSystemTypeCount,
    comment: TbSkylineDatetaskSystemTypeComment
} = TbSkylineDatetaskSystemTypeDefinition

/** 系统任务状态。 */
export enum TbSkylineDatetaskSystemStatus {
    STOP = 'stop',
    WAIT = 'wait',
    RUNNING = 'running',
    FINISH = 'finish'
}

export const TbSkylineDatetaskSystemStatusDefinition = defineEnumMetadata(TbSkylineDatetaskSystemStatus, '任务状态', {
    [TbSkylineDatetaskSystemStatus.STOP]: { label: '停止', description: '任务已停止调度' },
    [TbSkylineDatetaskSystemStatus.WAIT]: { label: '等待运行', description: '任务等待下一次调度' },
    [TbSkylineDatetaskSystemStatus.RUNNING]: { label: '运行中', description: '任务已启用并参与调度' },
    [TbSkylineDatetaskSystemStatus.FINISH]: { label: '已完成', description: '任务已执行完成' }
})

export const {
    metadata: TbSkylineDatetaskSystemStatusMetadata,
    options: TbSkylineDatetaskSystemStatusOptions,
    count: TbSkylineDatetaskSystemStatusCount,
    comment: TbSkylineDatetaskSystemStatusComment
} = TbSkylineDatetaskSystemStatusDefinition

/** 系统任务完整字段 DTO。 */
export class TbSkylineDatetaskSystemDto extends DataBaseDto {
    @ApiProperty({ description: '任务ID，系统内唯一的19位数字字符串', example: '2149446185344106496' })
    @IsString({ message: '任务ID必须是字符串' })
    @IsNotEmpty({ message: '任务ID必填' })
    @Length(1, 19, { message: '任务ID长度不能超过19位' })
    taskId: string

    @ApiProperty({ description: '任务名称', example: '汇率同步定时任务' })
    @IsString({ message: '任务名称必须是字符串' })
    @IsNotEmpty({ message: '任务名称必填' })
    @MaxLength(128, { message: '任务名称长度不能超过128位' })
    taskName: string

    @ApiProperty({ description: '处理器标识', example: 'datetask-sync-exchange-rate' })
    @IsString({ message: '处理器标识必须是字符串' })
    @IsNotEmpty({ message: '处理器标识必填' })
    @Length(1, 64, { message: '处理器标识长度不能超过64位' })
    handler: string

    @ApiProperty({ description: '任务描述', example: '每天从 Frankfurter 获取汇率并同步到 Finance 服务', required: false })
    @IsOptional()
    @IsString({ message: '任务描述必须是字符串' })
    @MaxLength(256, { message: '任务描述长度不能超过256位' })
    comment: string

    @ApiProperty({ description: 'Cron 表达式；手动任务可以为空', example: '0 0 8 * * *', required: false })
    @IsOptional()
    @IsString({ message: 'Cron表达式必须是字符串' })
    @MaxLength(32, { message: 'Cron表达式长度不能超过32位' })
    cron: string

    @ApiProperty({
        description: TbSkylineDatetaskSystemTypeComment,
        enum: TbSkylineDatetaskSystemType,
        enumName: 'TbSkylineDatetaskSystemType',
        example: TbSkylineDatetaskSystemType.SYSTEM
    })
    @IsEnum(TbSkylineDatetaskSystemType, { message: '任务类型格式错误' })
    type: TbSkylineDatetaskSystemType

    @ApiProperty({
        description: TbSkylineDatetaskSystemStatusComment,
        enum: TbSkylineDatetaskSystemStatus,
        enumName: 'TbSkylineDatetaskSystemStatus',
        example: TbSkylineDatetaskSystemStatus.RUNNING
    })
    @IsEnum(TbSkylineDatetaskSystemStatus, { message: '任务状态格式错误' })
    status: TbSkylineDatetaskSystemStatus

    @ApiProperty({ description: '任务参数', type: Object, example: { base: 'USD' }, required: false })
    @IsOptional()
    @IsObject({ message: '任务参数必须是对象' })
    body: Record<string, unknown>

    @ApiProperty({ description: '上次执行时间', format: 'date-time', example: '2026-09-02 08:00:00.000', required: false })
    @IsOptional()
    lastTime: Date

    @ApiProperty({ description: '下次执行时间', format: 'date-time', example: '2026-09-03 08:00:00.000', required: false })
    @IsOptional()
    nextTime: Date
}

@Index('uk_tb_skyline_datetask_system_task_name', ['taskName'], { unique: true })
@Index('uk_tb_skyline_datetask_system_task_id', ['taskId'], { unique: true })
@Index('idx_tb_skyline_datetask_system_status', ['status'])
@Entity({ name: 'tb_skyline_datetask_system', comment: 'Skyline 系统定时任务表' })
export class TbSkylineDatetaskSystem extends DataBaseAdapter {
    @Column({ name: TbSkylineDatetaskSystemColumn.TASK_ID, type: 'varchar', length: 19, nullable: false, update: false, comment: '任务ID' })
    taskId: string

    @Column({ name: TbSkylineDatetaskSystemColumn.TASK_NAME, type: 'varchar', length: 128, nullable: false, comment: '任务名称' })
    taskName: string

    @Column({ name: TbSkylineDatetaskSystemColumn.HANDLER, type: 'varchar', length: 64, nullable: false, comment: '处理器标识' })
    handler: string

    @Column({ name: TbSkylineDatetaskSystemColumn.COMMENT, type: 'varchar', length: 256, nullable: true, comment: '任务描述' })
    comment: string

    @Column({ name: TbSkylineDatetaskSystemColumn.CRON, type: 'varchar', length: 32, nullable: true, comment: 'Cron 表达式' })
    cron: string

    @Column({
        name: TbSkylineDatetaskSystemColumn.TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineDatetaskSystemTypeComment
    })
    type: TbSkylineDatetaskSystemType

    @Column({
        name: TbSkylineDatetaskSystemColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineDatetaskSystemStatusComment
    })
    status: TbSkylineDatetaskSystemStatus

    @WithJsonColumn({ name: TbSkylineDatetaskSystemColumn.BODY, nullable: true, comment: '任务参数' })
    body: Record<string, unknown>

    @DateWithColumn(Column, {
        name: TbSkylineDatetaskSystemColumn.LAST_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '上次执行时间'
    })
    lastTime: Date

    @DateWithColumn(Column, {
        name: TbSkylineDatetaskSystemColumn.NEXT_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '下次执行时间'
    })
    nextTime: Date
}
