const test = require('node:test')
const assert = require('node:assert/strict')
const { plainToInstance } = require('class-transformer')
const { validateSync } = require('class-validator')
const { TbSkylineDatetaskSystemDto } = require('../dist/src/schema/chat-web-skyline-mysql')

test('系统任务编号必须是 1 至 19 位数字字符串', () => {
    const valid = plainToInstance(TbSkylineDatetaskSystemDto, {
        taskId: '2149446185344106496',
        taskName: '汇率同步定时任务',
        handler: 'datetask-sync-exchange-rate',
        type: 'system',
        status: 'running'
    })
    assert.equal(validateSync(valid).length, 0)

    for (const taskId of ['12345678901234567890', 'task-123', '+123', '']) {
        const errors = validateSync(plainToInstance(TbSkylineDatetaskSystemDto, { ...valid, taskId }))
        assert.ok(
            errors.some(error => error.property === 'taskId'),
            `任务编号 ${taskId} 应校验失败`
        )
    }
})
