import type * as TaskDto from './feign-task.dto'

/**周期任务数据。*/
export type TaskCron = TaskDto.TaskCronResponseDto
/**周期任务分页数据。*/
export type TaskCronPage = TaskDto.TaskCronPageResponseDto
/**执行记录数据。*/
export type TaskExecution = TaskDto.TaskExecutionResponseDto
/**执行记录分页数据。*/
export type TaskExecutionPage = TaskDto.TaskExecutionPageResponseDto
/**周期任务分页查询入参。*/
export type TaskColumnCronInput = TaskDto.TaskColumnCronRequestDto
/**周期任务主键入参。*/
export type TaskCronKeyInput = TaskDto.TaskCronKeyRequestDto
/**修改周期任务状态入参。*/
export type TaskCronStatusUpdateInput = TaskDto.TaskCronStatusUpdateRequestDto
/**修改周期任务 Cron 入参。*/
export type TaskCronUpdateInput = TaskDto.TaskCronUpdateRequestDto
/**手动触发周期任务入参。*/
export type TaskTriggerCronInput = TaskDto.TaskTriggerCronRequestDto
/**手动触发周期任务结果。*/
export type TaskTriggerCronResult = TaskDto.TaskTriggerCronResponseDto
/**执行记录分页查询入参。*/
export type TaskColumnExecutionInput = TaskDto.TaskColumnExecutionRequestDto
/**单条执行记录查询入参。*/
export type TaskExecutionResolverInput = TaskDto.TaskExecutionResolverRequestDto

/** Task 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientTaskImplementation {
    /**分页查询周期任务**/
    httpBaseTaskColumnCron(authorization: string, input: TaskColumnCronInput): Promise<TaskCronPage>
    /**获取周期任务详情**/
    httpBaseTaskCronResolver(authorization: string, input: TaskCronKeyInput): Promise<TaskCron>
    /**启用或停用周期任务**/
    httpBaseTaskCronStatusUpdate(authorization: string, input: TaskCronStatusUpdateInput): Promise<TaskCron>
    /**修改周期任务 Cron 表达式**/
    httpBaseTaskUpdateCron(authorization: string, input: TaskCronUpdateInput): Promise<TaskCron>
    /**手动触发周期任务**/
    httpBaseTaskTriggerCron(authorization: string, input: TaskTriggerCronInput): Promise<TaskTriggerCronResult>
    /**分页查询执行记录**/
    httpBaseTaskColumnExecution(authorization: string, input: TaskColumnExecutionInput): Promise<TaskExecutionPage>
    /**获取单条执行记录**/
    httpBaseTaskExecutionResolver(authorization: string, input: TaskExecutionResolverInput): Promise<TaskExecution>
}
