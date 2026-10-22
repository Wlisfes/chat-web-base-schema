const test = require('node:test')
const assert = require('node:assert/strict')
const { plainToInstance } = require('class-transformer')
const { validateSync } = require('class-validator')
const { DECORATORS, PickType } = require('@nestjs/swagger')
const {
    PageDto,
    SizePageDto,
    assertUid,
    assertValidTree,
    buildTree,
    createTreeTool,
    filterTree,
    findTreeNode,
    findTreePath,
    fromTreeList,
    removeTreeNode,
    renameTreeChildren,
    toTreeList,
    generateUid,
    resolvePublicRequestUrl,
    resolveRequestId
} = require('../dist/src/utils')
const { EnumOptionDto, EnumsResponseDto, ListResponseDto, PageListResponseDto, PageResponseDataDto } = require('../dist/src/decorator')
const { BigintNumberTransformer, DataBaseDto, VagueDto, fetchVagueKeyword, fetchVagueNumberKeyword } = require('../dist/src/utils')
const requestContext = require('../dist/src/utils/modules/request-context')
const financeSchema = require('../dist/src/schema/chat-web-finance-mysql')
const crmSchema = require('../dist/src/schema/chat-web-crm-mysql')
const srmSchema = require('../dist/src/schema/chat-web-srm-mysql')
const skylineSchema = require('../dist/src/schema/chat-web-skyline-mysql')
const taskSchema = require('../dist/src/schema/chat-web-task-mysql')
const smsSchema = require('../dist/src/schema/chat-web-sms-mysql')

test('共享分页 DTO 使用统一的 page/size 请求契约', () => {
    const page = plainToInstance(PageDto, {})
    const sizePage = plainToInstance(SizePageDto, {})

    assert.deepEqual({ page: page.page, size: page.size }, { page: 1, size: 50 })
    assert.deepEqual({ page: sizePage.page, size: sizePage.size }, { page: 1, size: 50 })
    assert.equal(validateSync(plainToInstance(PageDto, { page: 0, size: 301 })).length, 2)
    assert.equal(validateSync(plainToInstance(SizePageDto, { page: 0, size: 301 })).length, 2)
    assert.equal(Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, SizePageDto.prototype, 'page').example, 1)
    assert.equal(Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, SizePageDto.prototype, 'size').example, 50)
})

test('共享分页响应字段统一为 page/size/total', () => {
    const properties = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, PageResponseDataDto.prototype) ?? []
    assert.deepEqual(properties.map(property => property.replace(/^:/, '')).sort(), ['page', 'size', 'total'])
    assert.equal(Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, PageResponseDataDto.prototype, 'pageSize'), undefined)
})

test('共享枚举选项 DTO 使用统一的 value/label/description/type', () => {
    const properties = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, EnumOptionDto.prototype) ?? []
    assert.deepEqual(properties.map(property => property.replace(/^:/, '')).sort(), ['description', 'label', 'type', 'value'])
})

test('枚举元数据的 type 取值限定在管理端标签颜色类型内', () => {
    // 与管理端 common-base-chunk 的 COMMON_BASE_CHUNK_TYPES 保持一致
    const allowed = new Set([
        'default',
        'primary',
        'info',
        'success',
        'warning',
        'error',
        'red',
        'orange',
        'lime',
        'green',
        'cyan',
        'blue',
        'geekblue',
        'purple',
        'pink',
        'volcano'
    ])
    const definitions = [
        ...Object.entries(financeSchema),
        ...Object.entries(crmSchema),
        ...Object.entries(srmSchema),
        ...Object.entries(skylineSchema),
        ...Object.entries(taskSchema),
        ...Object.entries(smsSchema)
    ].filter(([name, value]) => name.endsWith('Definition') && value && Array.isArray(value.options))

    assert.ok(definitions.length >= 29, `枚举 Definition 数量异常：${definitions.length}`)
    for (const [name, definition] of definitions) {
        for (const option of definition.options) {
            assert.ok(allowed.has(option.type), `${name} 的 ${option.value} 使用了非法颜色类型：${option.type}`)
        }
    }
})

test('共享枚举响应 DTO 工厂按字段生成 EnumOptionDto 数组', () => {
    const example = [{ value: 'menu', label: '菜单', description: '可导航到页面的菜单节点' }]
    const EnumsDto = EnumsResponseDto({
        type: { description: '菜单类型选项', example }
    })

    assert.deepEqual(
        (Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, EnumsDto.prototype) ?? []).map(property => property.replace(/^:/, '')),
        ['type']
    )
    const type = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, EnumsDto.prototype, 'type')
    assert.equal(type.description, '菜单类型选项')
    assert.equal(typeof type.type, 'function')
    assert.equal(type.isArray, true)
    assert.deepEqual(type.example, example)
})

test('共享响应 DTO 工厂生成带强类型 list 的普通和分页响应', () => {
    class ItemDto {}
    const ListDto = ListResponseDto(ItemDto)
    const PageListDto = PageListResponseDto(ItemDto)

    assert.deepEqual(
        (Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, ListDto.prototype) ?? []).map(property => property.replace(/^:/, '')),
        ['list']
    )
    assert.deepEqual(
        (Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, PageListDto.prototype) ?? [])
            .map(property => property.replace(/^:/, ''))
            .sort(),
        ['list', 'page', 'size', 'total']
    )
    assert.equal(typeof Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, ListDto.prototype, 'list').type, 'function')
})

test('基础主键 DTO 元数据允许作为请求入参复用', () => {
    class KeyDto extends PickType(DataBaseDto, ['keyId']) {}
    const keyId = Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, DataBaseDto.prototype, 'keyId')

    assert.equal(keyId.readOnly, undefined)
    assert.equal(validateSync(plainToInstance(KeyDto, {})).length, 1)
    assert.equal(validateSync(plainToInstance(KeyDto, { keyId: 0 })).length, 1)
    assert.equal(validateSync(plainToInstance(KeyDto, { keyId: '2' })).length, 0)
})

test('基础时间字段校验 YYYY-MM-DD HH:mm:ss 格式', () => {
    class TimeDto extends PickType(DataBaseDto, ['createTime', 'modifyTime']) {}

    assert.equal(validateSync(plainToInstance(TimeDto, {})).length, 0)
    assert.equal(validateSync(plainToInstance(TimeDto, { createTime: '2026-08-16 12:00:00' })).length, 0)
    assert.equal(
        validateSync(plainToInstance(TimeDto, { createTime: '2026-08-16 12:00:00.000', modifyTime: '2026-08-16 12:00:00.000' })).length,
        0
    )
    assert.equal(validateSync(plainToInstance(TimeDto, { createTime: '2026-08-16T12:00:00.000Z' })).length, 1)
    assert.equal(validateSync(plainToInstance(TimeDto, { modifyTime: '16/08/2026' })).length, 1)
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

test('通用树工具支持自定义字段并且不修改入参', () => {
    const list = [
        { keyId: 1, pid: null, name: '华东' },
        { keyId: 2, pid: 1, name: '上海' },
        { keyId: 3, pid: 2, name: '浦东' },
        { keyId: 4, pid: 1, name: '杭州' },
        { keyId: 5, pid: 99, name: '孤立节点' }
    ]
    const tree = fromTreeList(list, { id: 'keyId', children: 'items' })
    assert.equal(list[0].items, undefined)
    assert.deepEqual(
        tree.map(node => [node.keyId, node.items.map(child => child.keyId)]),
        [
            [1, [2, 4]],
            [5, []]
        ]
    )
    assert.deepEqual(
        toTreeList(tree, { children: 'items' }).map(node => node.keyId),
        [1, 2, 3, 4, 5]
    )
    assert.equal(findTreeNode(tree, node => node.keyId === 3, { children: 'items' }).name, '浦东')
    assert.deepEqual(
        findTreePath(tree, node => node.keyId === 3, { children: 'items' }).map(node => node.keyId),
        [1, 2, 3]
    )

    const filtered = filterTree(tree, node => node.name === '浦东', { children: 'items' })
    assert.deepEqual(
        toTreeList(filtered, { children: 'items' }).map(node => node.keyId),
        [1, 2, 3]
    )
    assert.equal(tree[0].items.length, 2)

    const instance = createTreeTool({ id: 'keyId', children: 'items' })
    assert.equal(
        instance.removeNode(tree, node => node.keyId === 2),
        1
    )
    assert.deepEqual(
        instance.toList(tree).map(node => node.keyId),
        [1, 4, 5]
    )
    renameTreeChildren(tree, 'items', 'children')
    assert.deepEqual(
        tree[0].children.map(node => node.keyId),
        [4]
    )
    assert.equal(tree[0].items, undefined)
})

test('共享 UID 与请求 ID 工具保持输入约束', () => {
    assert.match(generateUid(), /^\d{1,19}$/)
    assert.equal(assertUid('123456789'), '123456789')
    assert.throws(() => assertUid('invalid'), /必须是1-19位数字字符串/)
    assert.equal(resolveRequestId('request-123'), 'request-123')
    assert.match(resolveRequestId('bad request id'), /^[0-9a-f-]{36}$/)
    assert.match(resolveRequestId(123), /^[0-9a-f-]{36}$/)
    assert.equal(requestContext.resolveRequestId('request-456'), 'request-456')
    assert.equal(
        requestContext.runWithRequestContext('request-789', () => requestContext.getActiveRequestId()),
        'request-789'
    )
})

test('公共请求地址还原网关服务前缀且避免重复拼接', () => {
    assert.equal(
        resolvePublicRequestUrl({ originalUrl: '/sheet/update?source=manager', headers: { 'x-forwarded-prefix': '/api/account' } }),
        '/api/account/sheet/update?source=manager'
    )
    assert.equal(
        resolvePublicRequestUrl({ originalUrl: '/api/account/sheet/update', headers: { 'x-forwarded-prefix': '/api/account/' } }),
        '/api/account/sheet/update'
    )
    assert.equal(resolvePublicRequestUrl({ originalUrl: '/sheet/update', headers: {} }), '/sheet/update')
    assert.equal(
        resolvePublicRequestUrl({ originalUrl: '/sheet/update', headers: { 'x-forwarded-prefix': 'https://malicious.example/api' } }),
        '/sheet/update'
    )
})

test('bigint 金额字段从数据库读取时转换为 number', () => {
    assert.equal(BigintNumberTransformer.from('1008600'), 1008600)
    assert.equal(BigintNumberTransformer.from('0'), 0)
    assert.equal(BigintNumberTransformer.from(null), null)
    assert.equal(BigintNumberTransformer.to(1008600), 1008600)
})
test('通用模糊搜索 DTO 不进入基础表 DTO，只用于查询入参', () => {
    const base = new DataBaseDto()
    assert.equal('vague' in base, false)
    assert.equal(validateSync(plainToInstance(VagueDto, {})).length, 0)
    assert.equal(validateSync(plainToInstance(VagueDto, { vague: '8613' })).length, 0)
    assert.equal(validateSync(plainToInstance(VagueDto, { vague: 123 })).length, 1)
    assert.equal(validateSync(plainToInstance(VagueDto, { vague: 'a'.repeat(65) })).length, 1)
})

test('模糊搜索关键词去空白，号码关键词再去掉开头的 + 号', () => {
    assert.equal(fetchVagueKeyword('  8613  '), '8613')
    assert.equal(fetchVagueKeyword('   '), '')
    assert.equal(fetchVagueKeyword(), '')
    assert.equal(fetchVagueNumberKeyword(' +8613 '), '8613')
    assert.equal(fetchVagueNumberKeyword('8613'), '8613')
})
