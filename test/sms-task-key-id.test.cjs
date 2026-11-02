const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const smsSchemaRoot = join(__dirname, '../src/schema/chat-web-sms-mysql/sql')

test('短信任务表主键从 1002001 开始自增，建表脚本与整表 SQL 一致', () => {
    for (const file of ['tb_sms_task.sql', 'changes/20261102170000__tb_sms_task__create.sql']) {
        const sql = readFileSync(join(smsSchemaRoot, file), 'utf8')
        assert.match(sql, /CREATE TABLE IF NOT EXISTS `tb_sms_task`/i, file)
        assert.match(sql, /AUTO_INCREMENT\s*=\s*1002001/i, file)
    }
})