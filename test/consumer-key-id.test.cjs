const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const schemaRoot = join(__dirname, '../src/schema/chat-web-account-mysql/sql')

test('客户主键从 5181000 开始且现有主键按原顺序重排', () => {
    const canonicalSql = readFileSync(join(schemaRoot, 'tb_account_consumer.sql'), 'utf8')
    const changeSql = readFileSync(join(schemaRoot, 'changes/20260822210000__tb_account_consumer__reseed_key_id.sql'), 'utf8')

    assert.match(canonicalSql, /AUTO_INCREMENT\s*=\s*5181000/i)
    assert.match(changeSql, /START TRANSACTION/i)
    assert.match(changeSql, /SET `key_id` = -`key_id`/)
    assert.match(changeSql, /SET `key_id` = 5180999 - `key_id`/)
    assert.match(changeSql, /ALTER TABLE `tb_account_consumer` AUTO_INCREMENT = 5181000/i)
})
