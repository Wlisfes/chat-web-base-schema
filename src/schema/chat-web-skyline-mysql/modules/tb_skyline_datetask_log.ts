import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Length, Matches, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, DateWithColumn, WithJsonColumn, defineEnumMetadata } from '@/utils'

/** tb_skyline_datetask_log 的数据库字段名。 */
export enum TbSkylineDatetaskLogColumn {
    KEY_ID = 'key_id',
    EXECUTION_ID = 'execution_id',
    TASK_ID = 'task_id',
    TASK_NAME = 'task_name',
    STATUS = 'status',
    DURATION = 'duration',
    START_TIME = 'start_time',
    END_TIME = 'end_time',
    RESULT = 'result',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 任务执行日志状态。 */
export enum TbSkylineDatetaskLogStatus {
    RUNNING = 'running',
    SUCCESS = 'success',
    FAILED = 'failed'
}

export const TbSkylineDatetaskLogStatusDefinition = defineEnumMetadata(TbSkylineDatetaskLogStatus, '执行状态', {
    [TbSkylineDatetaskLogStatus.RUNNING]: { label: '执行中', description: '任务正在执行', type: 'info' },
    [TbSkylineDatetaskLogStatus.SUCCESS]: { label: '执行成功', description: '任务执行成功', type: 'success' },
    [TbSkylineDatetaskLogStatus.FAILED]: { label: '执行失败', description: '任务执行失败', type: 'error' }
})

/** 任务执行日志完整字段 DTO。 */
export class TbSkylineDatetaskLogDto extends DataBaseDto {
    @ApiProperty({ description: '执行记录ID，单次执行唯一', example: '2149446185344106496:1756771200000:1' })
    @IsString({ message: '执行记录ID必须是字符串' })
    @IsNotEmpty({ message: '执行记录ID必填' })
    @MaxLength(64, { message: '执行记录ID长度不能超过64位' })
    executionId: string

    @ApiProperty({ description: '任务ID，系统内唯一的19位数字字符串', example: '2149446185344106496' })
    @IsString({ message: '任务ID必须是字符串' })
    @IsNotEmpty({ message: '任务ID必填' })
    @Length(1, 19, { message: '任务ID长度不能超过19位' })
    @Matches(/^\d{1,19}$/, { message: '任务ID必须是1至19位数字字符串' })
    taskId: string

    @ApiProperty({ description: '任务名称（执行时快照）', example: '汇率同步定时任务', required: false })
    @IsOptional()
    @IsString({ message: '任务名称必须是字符串' })
    @MaxLength(128, { message: '任务名称长度不能超过128位' })
    taskName: string

    @ApiProperty({
        description: TbSkylineDatetaskLogStatusDefinition.comment,
        enum: TbSkylineDatetaskLogStatus,
        enumName: 'TbSkylineDatetaskLogStatus',
        example: TbSkylineDatetaskLogStatus.SUCCESS
    })
    @IsEnum(TbSkylineDatetaskLogStatus, { message: '执行状态格式错误' })
    status: TbSkylineDatetaskLogStatus

    @ApiProperty({ description: '执行耗时（毫秒）', example: 1250 })
    @Type(() => Number)
    @IsInt({ message: '执行耗时必须是整数' })
    @Min(0, { message: '执行耗时不能小于0' })
    duration: number

    @ApiProperty({ description: '开始时间', format: 'date-time', example: '2026-09-02 08:00:00.000' })
    @IsNotEmpty({ message: '开始时间必填' })
    startTime: Date

    @ApiProperty({ description: '结束时间', format: 'date-time', example: '2026-09-02 08:00:01.250', required: false })
    @IsOptional()
    endTime: Date

    @ApiProperty({ description: '执行结果或错误信息', type: Object, example: { date: '2026-09-02', count: 30 }, required: false })
    @IsOptional()
    @IsObject({ message: '执行结果必须是对象' })
    result: Record<string, unknown>
}

@Index('uk_tb_skyline_datetask_log_execution_id', ['executionId'], { unique: true })
@Index('idx_tb_skyline_datetask_log_task_id_start_time', ['taskId', 'startTime'])
@Entity({ name: 'tb_skyline_datetask_log', comment: 'Skyline 定时任务执行日志表' })
export class TbSkylineDatetaskLog extends DataBaseAdapter {
    @Column({
        name: TbSkylineDatetaskLogColumn.EXECUTION_ID,
        type: 'varchar',
        length: 64,
        nullable: false,
        update: false,
        comment: '执行记录ID'
    })
    executionId: string

    @Column({ name: TbSkylineDatetaskLogColumn.TASK_ID, type: 'varchar', length: 19, nullable: false, update: false, comment: '任务ID' })
    taskId: string

    @Column({ name: TbSkylineDatetaskLogColumn.TASK_NAME, type: 'varchar', length: 128, nullable: true, comment: '任务名称' })
    taskName: string

    @Column({
        name: TbSkylineDatetaskLogColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSkylineDatetaskLogStatusDefinition.comment
    })
    status: TbSkylineDatetaskLogStatus

    @Column({ name: TbSkylineDatetaskLogColumn.DURATION, type: 'int', nullable: false, default: 0, comment: '执行耗时（毫秒）' })
    duration: number

    @DateWithColumn(Column, {
        name: TbSkylineDatetaskLogColumn.START_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '开始时间',
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    })
    startTime: Date

    @DateWithColumn(Column, {
        name: TbSkylineDatetaskLogColumn.END_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '结束时间',
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    })
    endTime: Date

    @WithJsonColumn({ name: TbSkylineDatetaskLogColumn.RESULT, nullable: true, comment: '执行结果' })
    result: Record<string, unknown>
}
