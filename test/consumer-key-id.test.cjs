const test = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const crmSchemaRoot = join(__dirname, '../src/schema/chat-web-crm-mysql/sql')

test('客户主表由 CRM 维护', () => {
    const canonicalSql = readFileSync(join(crmSchemaRoot, 'tb_crm_user.sql'), 'utf8')

    assert.match(canonicalSql, /AUTO_INCREMENT\s*=\s*10241000/i)
    assert.match(canonicalSql, /CREATE TABLE IF NOT EXISTS `tb_crm_user`/i)
})
