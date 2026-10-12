const test = require('node:test')
const assert = require('node:assert/strict')
const { plainToInstance } = require('class-transformer')
const { validateSync } = require('class-validator')
const { TbTaskCronDto, TbTaskExecutionDto, TbTaskCronStatus, TbTaskCronModule } = require('../dist/src/schema/chat-web-task-mysql')

const cron = {
    keyId: 1,
    taskId: '2149446185344106496',
    taskName: '汇率同步定时任务',
    module: 'TASK_FINANCE',
    handler: 'datetask-sync-exchange-rate',
    cron: '0 0 8 * * *',
    status: 'enable',
    maxAttempts: 8,
    createBy: '0',
    modifyBy: '0'
}

test('周期任务状态只有启用和停用两种', () => {
    assert.deepEqual(Object.values(TbTaskCronStatus).sort(), ['disable', 'enable'])
    assert.equal(validateSync(plainToInstance(TbTaskCronDto, cron)).length, 0)
    const errors = validateSync(plainToInstance(TbTaskCronDto, { ...cron, status: 'running' }))
    assert.ok(errors.some(error => error.property === 'status'))
})

test('周期任务所属模块必填且只能取已定义的模块', () => {
    assert.deepEqual(Object.values(TbTaskCronModule).sort(), ['TASK_CRM', 'TASK_FINANCE', 'TASK_SYSTEM'])
    for (const module of [undefined, 'CHUNK_CRM', 'finance']) {
        const errors = validateSync(plainToInstance(TbTaskCronDto, { ...cron, module }))
        assert.ok(
            errors.some(error => error.property === 'module'),
            `所属模块 ${module} 应校验失败`
        )
    }
})

test('周期任务 Cron 表达式必填，最大尝试次数为 1 至 20', () => {
    assert.ok(validateSync(plainToInstance(TbTaskCronDto, { ...cron, cron: '' })).some(error => error.property === 'cron'))
    for (const maxAttempts of [0, 21]) {
        const errors = validateSync(plainToInstance(TbTaskCronDto, { ...cron, maxAttempts }))
        assert.ok(
            errors.some(error => error.property === 'maxAttempts'),
            `最大尝试次数 ${maxAttempts} 应校验失败`
        )
    }
})

test('执行记录 ID、任务 ID 必须是 1 至 19 位数字字符串，业务键必填', () => {
    const execution = {
        keyId: 1,
        executionId: '2150123456789012345',
        taskId: '2149446185344106496',
        taskName: '汇率同步定时任务',
        handler: 'datetask-sync-exchange-rate',
        bizKey: '2149446185344106496:20261012080000',
        triggerType: 'system',
        status: 'pending',
        attempts: 0,
        maxAttempts: 8,
        scheduledTime: new Date('2026-10-12T00:00:00.000Z'),
        duration: 0,
        createBy: '0',
        modifyBy: '0'
    }
    assert.equal(validateSync(plainToInstance(TbTaskExecutionDto, execution)).length, 0)
    for (const [property, value] of [
        ['executionId', 'exec-1'],
        ['taskId', '12345678901234567890'],
        ['bizKey', ''],
        ['status', 'stop'],
        ['triggerType', 'retry']
    ]) {
        const errors = validateSync(plainToInstance(TbTaskExecutionDto, { ...execution, [property]: value }))
        assert.ok(
            errors.some(error => error.property === property),
            `${property}=${value} 应校验失败`
        )
    }
})
