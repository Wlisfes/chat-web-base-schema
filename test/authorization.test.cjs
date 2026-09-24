const assert = require('node:assert/strict')
const test = require('node:test')
const { ForbiddenException, Logger, ServiceUnavailableException } = require('@nestjs/common')
const { MODULE_METADATA } = require('@nestjs/common/constants')
const { AuthorizationGuard, AuthorizationModule, AuthorizationService } = require('../dist/src/runtime/auth')

function config(initial = {}) {
    const values = { ...initial }
    return {
        get(key, fallback) {
            if (Object.prototype.hasOwnProperty.call(values, key)) return values[key]
            const resolved = key.split('.').reduce((current, segment) => {
                if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, segment)) return undefined
                return current[segment]
            }, values)
            return resolved === undefined ? fallback : resolved
        }
    }
}

function createContext(user) {
    const request = { user }
    return {
        request,
        getHandler: () => function handler() {},
        getClass: () => class TestController {},
        switchToHttp: () => ({
            getRequest: () => request
        })
    }
}

const authorizedPrincipal = {
    allowed: true,
    superAdmin: false,
    roleCodes: ['admin'],
    all: false,
    items: ['2281665656346656771']
}

// 守卫会把 allowed 之外的授权字段挂到 request.user。
const attachedAuthorization = {
    superAdmin: false,
    roleCodes: ['admin'],
    all: false,
    items: ['2281665656346656771']
}

test('auth 子路径导出业务服务授权适配层', () => {
    assert.equal(typeof AuthorizationService, 'function')
    assert.equal(typeof AuthorizationGuard, 'function')
    assert.equal(typeof AuthorizationModule, 'function')
    assert.deepEqual(Reflect.getMetadata(MODULE_METADATA.EXPORTS, AuthorizationModule), [AuthorizationService, AuthorizationGuard])
})

test('AuthorizationGuard 未使用 RequirePermissions 时不请求 Auth', async () => {
    let called = false
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => undefined },
        {
            async resolveAuthorizedPrincipal() {
                called = true
                return authorizedPrincipal
            }
        }
    )
    const context = createContext({ uid: '2281665656346656771', sessionId: 's1' })
    assert.equal(await guard.canActivate(context), true)
    assert.equal(called, false)
    assert.deepEqual(context.request.user, { uid: '2281665656346656771', sessionId: 's1' })
})

test('AuthorizationGuard 无权限码且无用户时直接放行', async () => {
    let called = false
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => [] },
        {
            async resolveAuthorizedPrincipal() {
                called = true
                return authorizedPrincipal
            }
        }
    )
    assert.equal(await guard.canActivate(createContext(undefined)), true)
    assert.equal(called, false)
})

test('AuthorizationGuard 缺少登录用户时抛出 403', async () => {
    let called = false
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => ['account:user:list'] },
        {
            async resolveAuthorizedPrincipal() {
                called = true
                return authorizedPrincipal
            }
        }
    )
    await assert.rejects(
        () => guard.canActivate(createContext(undefined)),
        error => {
            assert.equal(error instanceof ForbiddenException, true)
            assert.equal(error.message, '缺少权限：account:user:list')
            return true
        }
    )
    assert.equal(called, false)
})

test('AuthorizationGuard 权限不足时抛出 403', async () => {
    const calls = []
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => ['account:user:list', 'account:user:create'] },
        {
            async resolveAuthorizedPrincipal(uid, permissionCodes) {
                calls.push(['resolveAuthorizedPrincipal', uid, permissionCodes])
                assert.equal(uid, '2281665656346656771')
                assert.deepEqual(permissionCodes, ['account:user:list', 'account:user:create'])
                return { ...authorizedPrincipal, allowed: false }
            }
        }
    )
    await assert.rejects(
        () => guard.canActivate(createContext({ uid: '2281665656346656771' })),
        error => {
            assert.equal(error instanceof ForbiddenException, true)
            assert.equal(error.message, '缺少权限：account:user:list, account:user:create')
            return true
        }
    )
    assert.deepEqual(calls, [['resolveAuthorizedPrincipal', '2281665656346656771', ['account:user:list', 'account:user:create']]])
})

test('AuthorizationGuard 权限校验通过时挂载角色与数据范围并放行', async () => {
    const calls = []
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => ['account:user:list'] },
        {
            async resolveAuthorizedPrincipal(uid, permissionCodes) {
                calls.push(['resolveAuthorizedPrincipal', uid, permissionCodes])
                return authorizedPrincipal
            }
        }
    )
    const context = createContext({ uid: '2281665656346656771', number: 'A001', name: '张三', sessionId: 's1' })
    assert.equal(await guard.canActivate(context), true)
    assert.deepEqual(calls, [['resolveAuthorizedPrincipal', '2281665656346656771', ['account:user:list']]])
    assert.deepEqual(context.request.user, {
        uid: '2281665656346656771',
        number: 'A001',
        name: '张三',
        sessionId: 's1',
        ...attachedAuthorization
    })
})

test('AuthorizationGuard 传入星号时仍查询授权身份并挂载数据范围', async () => {
    const calls = []
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => ['*'] },
        {
            async resolveAuthorizedPrincipal(uid, permissionCodes) {
                calls.push(['resolveAuthorizedPrincipal', uid, permissionCodes])
                return authorizedPrincipal
            }
        }
    )
    const context = createContext({ uid: '2281665656346656771', sessionId: 's1' })
    assert.equal(await guard.canActivate(context), true)
    assert.deepEqual(calls, [['resolveAuthorizedPrincipal', '2281665656346656771', ['*']]])
    assert.deepEqual(context.request.user, {
        uid: '2281665656346656771',
        sessionId: 's1',
        ...attachedAuthorization
    })
})

function createService(authClient, initial) {
    return new AuthorizationService(authClient, config(initial))
}

test('AuthorizationService 使用服务凭据调用 Auth 授权身份接口', async () => {
    const calls = []
    const authClient = {
        async httpBaseAuthAuthorizedPrincipalResolver(authorization, input) {
            calls.push(['httpBaseAuthAuthorizedPrincipalResolver', authorization, input])
            return authorizedPrincipal
        }
    }
    const service = createService(authClient, { gateway: { feign: { service_token: 'service-token' } } })
    assert.deepEqual(await service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list']), authorizedPrincipal)
    assert.deepEqual(calls, [
        [
            'httpBaseAuthAuthorizedPrincipalResolver',
            'Bearer service-token',
            { uid: '2281665656346656771', permissionCodes: ['account:user:list'] }
        ]
    ])
})

test('AuthorizationService 缺少服务凭据时抛出 ServiceUnavailableException', async () => {
    const service = createService({}, {})
    await assert.rejects(() => service.resolveAuthorizedPrincipal('1', ['account:user:list']), ServiceUnavailableException)
})

test('AuthorizationService 缓存失效失败只记录告警不抛错', async () => {
    const warnings = []
    const originalWarn = Logger.prototype.warn
    Logger.prototype.warn = function warn(message) {
        warnings.push(message)
    }
    try {
        const service = createService(
            {
                async httpBaseAuthInvalidatePermissionCache() {
                    throw new Error('auth unavailable')
                }
            },
            { gateway: { feign: { service_token: 'service-token' } } }
        )
        await service.invalidate({ uids: ['2281665656346656771'] })
        assert.equal(
            warnings.some(item => String(item).includes('Auth 权限缓存失效通知失败：auth unavailable')),
            true
        )
    } finally {
        Logger.prototype.warn = originalWarn
    }
})

test('AuthorizationService 并发同一权限查询只调用 Auth 一次', async () => {
    let calls = 0
    const service = createService(
        {
            async httpBaseAuthAuthorizedPrincipalResolver() {
                calls += 1
                return authorizedPrincipal
            }
        },
        { gateway: { feign: { service_token: 'service-token' } } }
    )
    const results = await Promise.all([
        service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list']),
        service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list']),
        service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list'])
    ])
    assert.deepEqual(results, [authorizedPrincipal, authorizedPrincipal, authorizedPrincipal])
    assert.equal(calls, 1)
    assert.deepEqual(await service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list']), authorizedPrincipal)
    assert.equal(calls, 1)
})

test('AuthorizationService 权限码顺序不同时命中同一份缓存', async () => {
    let calls = 0
    const service = createService(
        {
            async httpBaseAuthAuthorizedPrincipalResolver() {
                calls += 1
                return authorizedPrincipal
            }
        },
        { gateway: { feign: { service_token: 'service-token' } } }
    )
    await service.resolveAuthorizedPrincipal('2281665656346656771', ['b:read', 'a:read'])
    await service.resolveAuthorizedPrincipal('2281665656346656771', ['a:read', 'b:read'])
    assert.equal(calls, 1)
})

test('AuthorizationService 星号权限码归一化后命中同一份缓存', async () => {
    const calls = []
    const service = createService(
        {
            async httpBaseAuthAuthorizedPrincipalResolver(_authorization, input) {
                calls.push(input.permissionCodes)
                return authorizedPrincipal
            }
        },
        { gateway: { feign: { service_token: 'service-token' } } }
    )
    await service.resolveAuthorizedPrincipal('2281665656346656771', ['*', 'account:user:list'])
    await service.resolveAuthorizedPrincipal('2281665656346656771', ['*'])
    assert.deepEqual(calls, [['*']])
})

test('AuthorizationService 查询失败不写入缓存', async () => {
    let calls = 0
    const service = createService(
        {
            async httpBaseAuthAuthorizedPrincipalResolver() {
                calls += 1
                if (calls === 1) throw new Error('auth unavailable')
                return authorizedPrincipal
            }
        },
        { gateway: { feign: { service_token: 'service-token' } } }
    )
    await assert.rejects(() => service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list']), /auth unavailable/)
    assert.deepEqual(await service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list']), authorizedPrincipal)
    assert.equal(calls, 2)
})

test('AuthorizationService 缓存失效后重新查询 Auth', async () => {
    let calls = 0
    const service = createService(
        {
            async httpBaseAuthAuthorizedPrincipalResolver() {
                calls += 1
                return authorizedPrincipal
            },
            async httpBaseAuthInvalidatePermissionCache() {
                return { success: true }
            }
        },
        { gateway: { feign: { service_token: 'service-token' } } }
    )
    await service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list'])
    await service.invalidate({ uids: ['2281665656346656771'] })
    await service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list'])
    assert.equal(calls, 2)
})
