import { ApiProperty, ApiPropertyOptional, IntersectionType, PartialType, PickType } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator'
import * as Schema from '@/schema/chat-web-task-mysql'
import { PageResponseDataDto } from '@/decorator'
import { PageDto } from '@/utils'

/** 周期任务服务间响应。 */
export class TaskCronResponseDto extends Schema.TbTaskCronDto {}

/** 周期任务分页响应。 */
export class TaskCronPageResponseDto extends PageResponseDataDto {
    @ApiProperty({ description: '周期任务列表', type: [TaskCronResponseDto] })
    list: TaskCronResponseDto[]
}

/** 执行记录服务间响应。 */
export class TaskExecutionResponseDto extends Schema.TbTaskExecutionDto {}

/** 执行记录分页响应。 */
export class TaskExecutionPageResponseDto extends PageResponseDataDto {
    @ApiProperty({ description: '执行记录列表', type: [TaskExecutionResponseDto] })
    list: TaskExecutionResponseDto[]
}

/** 周期任务主键参数。 */
export class TaskCronKeyRequestDto {
    @ApiProperty({ description: '任务ID（19位数字字符串）', example: '2149446185344106496' })
    @IsString({ message: '任务ID必须是字符串' })
    @IsNotEmpty({ message: '任务ID不能为空' })
    @Matches(/^\d{1,19}$/, { message: '任务ID必须是1至19位数字字符串' })
    taskId: string
}

/** 写操作的操作人；由调用方（Skyline）校验用户权限后传入，task 服务只记录不鉴权。 */
export class TaskOperatorRequestDto {
    @ApiProperty({ description: '操作人账号UID', example: '2149446185344106496' })
    @IsString({ message: '操作人UID必须是字符串' })
    @IsNotEmpty({ message: '操作人UID不能为空' })
    @Matches(/^\d{1,19}$/, { message: '操作人UID必须是1至19位数字字符串' })
    operatorUid: string
}

/** 周期任务分页查询参数。 */
export class TaskColumnCronRequestDto extends IntersectionType(
    PageDto,
    PartialType(PickType(Schema.TbTaskCronDto, ['taskName', 'module', 'status'] as const))
) {}

/** 修改周期任务状态参数。 */
export class TaskCronStatusUpdateRequestDto extends IntersectionType(TaskCronKeyRequestDto, TaskOperatorRequestDto) {
    @ApiProperty({
        description: Schema.TbTaskCronStatusDefinition.comment,
        enum: Schema.TbTaskCronStatus,
        example: Schema.TbTaskCronStatus.ENABLE
    })
    @IsEnum(Schema.TbTaskCronStatus, { message: '任务状态格式错误' })
    status: Schema.TbTaskCronStatus
}

/** 修改周期任务 Cron 参数。 */
export class TaskCronUpdateRequestDto extends IntersectionType(TaskCronKeyRequestDto, TaskOperatorRequestDto) {
    @ApiProperty({ description: 'Cron 表达式（秒 分 时 日 月 周，也支持5段）', example: '0 0 8,20 * * *' })
    @IsString({ message: 'Cron表达式必须是字符串' })
    @IsNotEmpty({ message: 'Cron表达式不能为空' })
    @MaxLength(32, { message: 'Cron表达式长度不能超过32位' })
    cron: string
}

/** 手动触发周期任务参数。 */
export class TaskTriggerCronRequestDto extends IntersectionType(TaskCronKeyRequestDto, TaskOperatorRequestDto) {}

/** 手动触发结果；最多等待数秒，期间完成则返回最终状态，否则返回待执行或执行中的记录供调用方轮询。 */
export class TaskTriggerCronResponseDto {
    @ApiProperty({ description: '执行记录ID', example: '2150123456789012345' })
    executionId: string

    @ApiProperty({ description: '是否已在等待时间内结束（成功或失败）', example: true })
    finished: boolean

    @ApiProperty({ description: '执行记录', type: TaskExecutionResponseDto })
    execution: TaskExecutionResponseDto
}

/** 执行记录分页查询参数。 */
export class TaskColumnExecutionRequestDto extends IntersectionType(PageDto, TaskCronKeyRequestDto) {
    @ApiPropertyOptional({
        description: Schema.TbTaskExecutionStatusDefinition.comment,
        enum: Schema.TbTaskExecutionStatus,
        example: Schema.TbTaskExecutionStatus.SUCCESS
    })
    @IsOptional()
    @IsEnum(Schema.TbTaskExecutionStatus, { message: '执行状态格式错误' })
    status?: Schema.TbTaskExecutionStatus
}

/** 单条执行记录查询参数。 */
export class TaskExecutionResolverRequestDto {
    @ApiProperty({ description: '执行记录ID（19位数字字符串）', example: '2150123456789012345' })
    @IsString({ message: '执行记录ID必须是字符串' })
    @IsNotEmpty({ message: '执行记录ID不能为空' })
    @Matches(/^\d{1,19}$/, { message: '执行记录ID必须是1至19位数字字符串' })
    executionId: string
}
