const test = require('node:test')
const assert = require('node:assert/strict')
const { plainToInstance } = require('class-transformer')
const { validateSync } = require('class-validator')
const { DECORATORS } = require('@nestjs/swagger')
const { PageDto, SizePageDto, assertUid, assertValidTree, buildTree, generateUid, resolveRequestId } = require('../dist/src/utils')
const { PageResponseDataDto } = require('../dist/src/decorator')
const requestContext = require('../dist/src/utils/modules/request-context')

test('共享分页 DTO 使用统一的 page/size 请求契约', () => {
    const page = plainToInstance(PageDto, {})
    const sizePage = plainToInstance(SizePageDto, {})

    assert.deepEqual({ page: page.page, size: page.size }, { page: 1, size: 50 })
    assert.deepEqual({ page: sizePage.page, size: sizePage.size }, { page: 1, size: 50 })
    assert.equal(validateSync(plainToInstance(PageDto, { page: 0, size: 101 })).length, 2)
    assert.equal(validateSync(plainToInstance(SizePageDto, { page: 0, size: 101 })).length, 2)
    assert.equal(Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, SizePageDto.prototype, 'page').example, 1)
    assert.equal(Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, SizePageDto.prototype, 'size').example, 50)
})

test('共享分页响应字段统一为 page/size/total', () => {
    const properties = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, PageResponseDataDto.prototype) ?? []
    assert.deepEqual(properties.map(property => property.replace(/^:/, '')).sort(), ['page', 'size', 'total'])
    assert.equal(Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, PageResponseDataDto.prototype, 'pageSize'), undefined)
})

test('共享树工具校验层级并稳定排序', () => {
    const nodes = [
        { keyId: 2, parentKeyId: 1, sort: 2 },
        { keyId: 1, sort: 1 },
        { keyId: 3, parentKeyId: 1, sort: 1 }
    ]
    assert.doesNotThrow(() => assertValidTree(nodes, '节点'))
    assert.deepEqual(
        buildTree(nodes)[0].children.map(node => node.keyId),
        [3, 2]
    )
    assert.throws(() => assertValidTree([{ keyId: 1, parentKeyId: 2, sort: 1 }], '节点'), /父节点 2 不存在/)
})

test('共享 UID 与请求 ID 工具保持输入约束', () => {
    assert.match(generateUid(), /^\d{1,19}$/)
    assert.equal(assertUid('123456789'), '123456789')
    assert.throws(() => assertUid('invalid'), /必须是1-19位数字字符串/)
    assert.equal(resolveRequestId('request-123'), 'request-123')
    assert.match(resolveRequestId('bad request id'), /^[0-9a-f-]{36}$/)
    assert.equal(requestContext.resolveRequestId('request-456'), 'request-456')
    assert.equal(
        requestContext.runWithRequestContext('request-789', () => requestContext.getActiveRequestId()),
        'request-789'
    )
})
