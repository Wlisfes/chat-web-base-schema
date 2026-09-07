const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const accountSchemaRoot = join(__dirname, '../src/schema/chat-web-account-mysql/sql')
const crmSchemaRoot = join(__dirname, '../src/schema/chat-web-crm-mysql/sql')

test('客户主表迁移到 CRM 并清理 Account 旧表', () => {
    const canonicalSql = readFileSync(join(crmSchemaRoot, 'tb_crm_consumer.sql'), 'utf8')
    const dropSql = readFileSync(join(accountSchemaRoot, 'changes/20260907090001__tb_account_consumer__drop.sql'), 'utf8')

    assert.match(canonicalSql, /AUTO_INCREMENT\s*=\s*5181000/i)
    assert.match(canonicalSql, /CREATE TABLE IF NOT EXISTS `tb_crm_consumer`/i)
    assert.match(dropSql, /DROP TABLE IF EXISTS `tb_account_consumer`/i)
})
