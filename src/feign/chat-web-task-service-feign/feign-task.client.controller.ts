import { FeignBody, FeignClient, FeignHeader, FeignPost } from '../feign.decorator'
import { FeignWebClient } from '../feign.web.client'
import * as TaskDto from './feign-task.dto'
import type * as TaskTypes from './feign-task.interface'
import { ConfigService } from '@nestjs/config'

/**
 * Task 服务业务 Feign 客户端。
 *
 * 请求通过 Gateway 访问 Task 服务的 `/feign/task` 服务间入口；Task 服务不开放 `/api/task`，管理端经由 Skyline 转发。
 * Gateway 地址读取 Nacos `gateway.feign.url`；超时单独读取 `gateway.feign.task_timeout`，
 * 手动触发需要等待任务执行，其余服务客户端仍使用 `gateway.feign.timeout`。服务端在分发实现方法前校验 `gateway.feign.service_token`。
 */
@FeignClient({
    name: 'Task服务',
    prefix: '/feign/task',
    serviceTokenKey: 'gateway.feign.service_token',
    baseUrlConfigKey: 'gateway.feign.url',
    timeoutConfigKey: 'gateway.feign.task_timeout'
})
export class FeignClientTaskManager extends FeignWebClient<TaskTypes.FeignClientTaskImplementation> {
    constructor(service?: TaskTypes.FeignClientTaskImplementation, configService?: ConfigService) {
        super(service, configService)
    }

    /**分页查询周期任务**/
    @FeignPost('/cron/column', {
        operation: { summary: '供内部服务分页查询周期任务' },
        request: { source: 'body', type: TaskDto.TaskColumnCronRequestDto },
        response: { type: TaskDto.TaskCronPageResponseDto, description: '周期任务分页数据' }
    })
    async httpBaseTaskColumnCron(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: TaskTypes.TaskColumnCronInput
    ): Promise<TaskTypes.TaskCronPage> {
        return this.dispatch('httpBaseTaskColumnCron', _authorization, _input)
    }

    /**获取周期任务详情**/
    @FeignPost('/cron/resolve', {
        operation: { summary: '供内部服务获取周期任务详情' },
        request: { source: 'body', type: TaskDto.TaskCronKeyRequestDto },
        response: { type: TaskDto.TaskCronResponseDto, description: '周期任务详情' }
    })
    async httpBaseTaskCronResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: TaskTypes.TaskCronKeyInput
    ): Promise<TaskTypes.TaskCron> {
        return this.dispatch('httpBaseTaskCronResolver', _authorization, _input)
    }

    /**启用或停用周期任务**/
    @FeignPost('/cron/status/update', {
        operation: { summary: '供内部服务启用或停用周期任务' },
        request: { source: 'body', type: TaskDto.TaskCronStatusUpdateRequestDto },
        response: { type: TaskDto.TaskCronResponseDto, description: '更新后的周期任务' }
    })
    async httpBaseTaskCronStatusUpdate(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: TaskTypes.TaskCronStatusUpdateInput
    ): Promise<TaskTypes.TaskCron> {
        return this.dispatch('httpBaseTaskCronStatusUpdate', _authorization, _input)
    }

    /**修改周期任务 Cron 表达式**/
    @FeignPost('/cron/update', {
        operation: { summary: '供内部服务修改周期任务 Cron 表达式' },
        request: { source: 'body', type: TaskDto.TaskCronUpdateRequestDto },
        response: { type: TaskDto.TaskCronResponseDto, description: '更新后的周期任务' }
    })
    async httpBaseTaskUpdateCron(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: TaskTypes.TaskCronUpdateInput
    ): Promise<TaskTypes.TaskCron> {
        return this.dispatch('httpBaseTaskUpdateCron', _authorization, _input)
    }

    /**手动触发周期任务**/
    @FeignPost('/cron/trigger', {
        operation: { summary: '供内部服务手动触发周期任务，最多等待数秒返回执行结果' },
        request: { source: 'body', type: TaskDto.TaskTriggerCronRequestDto },
        response: { type: TaskDto.TaskTriggerCronResponseDto, description: '执行记录及是否已结束' }
    })
    async httpBaseTaskTriggerCron(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: TaskTypes.TaskTriggerCronInput
    ): Promise<TaskTypes.TaskTriggerCronResult> {
        return this.dispatch('httpBaseTaskTriggerCron', _authorization, _input)
    }

    /**分页查询执行记录**/
    @FeignPost('/execution/column', {
        operation: { summary: '供内部服务分页查询周期任务执行记录' },
        request: { source: 'body', type: TaskDto.TaskColumnExecutionRequestDto },
        response: { type: TaskDto.TaskExecutionPageResponseDto, description: '执行记录分页数据' }
    })
    async httpBaseTaskColumnExecution(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: TaskTypes.TaskColumnExecutionInput
    ): Promise<TaskTypes.TaskExecutionPage> {
        return this.dispatch('httpBaseTaskColumnExecution', _authorization, _input)
    }

    /**获取单条执行记录**/
    @FeignPost('/execution/resolve', {
        operation: { summary: '供内部服务获取单条执行记录，用于手动触发后轮询结果' },
        request: { source: 'body', type: TaskDto.TaskExecutionResolverRequestDto },
        response: { type: TaskDto.TaskExecutionResponseDto, description: '执行记录' }
    })
    async httpBaseTaskExecutionResolver(
        @FeignHeader('authorization') _authorization: string,
        @FeignBody() _input: TaskTypes.TaskExecutionResolverInput
    ): Promise<TaskTypes.TaskExecution> {
        return this.dispatch('httpBaseTaskExecutionResolver', _authorization, _input)
    }
}
