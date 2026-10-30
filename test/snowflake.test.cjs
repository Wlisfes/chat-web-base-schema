const test = require('node:test')
const assert = require('node:assert/strict')
const { generateSnowflakeId } = require('../dist/src/utils')

test('雪花 ID 是不超过 19 位的数字字符串，同一进程内不重复且递增', () => {
    const ids = Array.from({ length: 1000 }, () => generateSnowflakeId())
    assert.equal(new Set(ids).size, ids.length)
    for (const id of ids) {
        assert.match(id, /^\d{1,19}$/)
    }
    for (let index = 1; index < ids.length; index += 1) {
        assert.equal(BigInt(ids[index]) > BigInt(ids[index - 1]), true)
    }
})
