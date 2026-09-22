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

test('AuthorizationGuard 无权限码且无用户时直接放行', async () => {
    let called = false
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => [] },
        {
            async hasPermission() {
                called = true
                return false
            },
            async resolveAuthorizedPrincipal() {
                called = true
                return authorizedPrincipal
            }
        }
    )
    assert.equal(await guard.canActivate(createContext(undefined)), true)
    assert.equal(called, false)
})

test('AuthorizationGuard 无权限码但有用户时仍挂载数据范围', async () => {
    const calls = []
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => [] },
        {
            async hasPermission() {
                calls.push('hasPermission')
                return false
            },
            async resolveAuthorizedPrincipal(uid, permissionCodes) {
                calls.push(['resolveAuthorizedPrincipal', uid, permissionCodes])
                return authorizedPrincipal
            }
        }
    )
    const context = createContext({ uid: '2281665656346656771', sessionId: 's1' })
    assert.equal(await guard.canActivate(context), true)
    assert.deepEqual(calls, [['resolveAuthorizedPrincipal', '2281665656346656771', []]])
    assert.deepEqual(context.request.user, {
        uid: '2281665656346656771',
        sessionId: 's1',
        ...authorizedPrincipal
    })
})

test('AuthorizationGuard 缺少登录用户时抛出 403', async () => {
    let called = false
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => ['account:user:list'] },
        {
            async hasPermission() {
                called = true
                return true
            },
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
            async hasPermission(uid, permissionCodes) {
                calls.push(['hasPermission', uid, permissionCodes])
                assert.equal(uid, '2281665656346656771')
                assert.deepEqual(permissionCodes, ['account:user:list', 'account:user:create'])
                return false
            },
            async resolveAuthorizedPrincipal() {
                calls.push('resolveAuthorizedPrincipal')
                return authorizedPrincipal
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
    // 权限校验与授权身份并发发起，权限不足时仍然抛出 403。
    assert.deepEqual(calls, [
        ['hasPermission', '2281665656346656771', ['account:user:list', 'account:user:create']],
        'resolveAuthorizedPrincipal'
    ])
})

test('AuthorizationGuard 权限校验通过时挂载数据范围并放行', async () => {
    const calls = []
    const guard = new AuthorizationGuard(
        { getAllAndOverride: () => ['account:user:list'] },
        {
            async hasPermission(uid, permissionCodes) {
                calls.push(['hasPermission', uid, permissionCodes])
                return true
            },
            async resolveAuthorizedPrincipal(uid, permissionCodes) {
                calls.push(['resolveAuthorizedPrincipal', uid, permissionCodes])
                return authorizedPrincipal
            }
        }
    )
    const context = createContext({ uid: '2281665656346656771', number: 'A001', name: '张三', sessionId: 's1' })
    assert.equal(await guard.canActivate(context), true)
    assert.deepEqual(calls, [
        ['hasPermission', '2281665656346656771', ['account:user:list']],
        ['resolveAuthorizedPrincipal', '2281665656346656771', ['account:user:list']]
    ])
    assert.deepEqual(context.request.user, {
        uid: '2281665656346656771',
        number: 'A001',
        name: '张三',
        sessionId: 's1',
        ...authorizedPrincipal
    })
})

function createService(authClient, initial) {
    return new AuthorizationService(authClient, config(initial))
}

test('AuthorizationService 使用服务凭据调用 Auth 权限接口', async () => {
    const calls = []
    const authClient = {
        async checkPermission(authorization, input) {
            calls.push(['checkPermission', authorization, input])
            return { allowed: true }
        },
        async checkSuperAdmin(authorization, input) {
            calls.push(['checkSuperAdmin', authorization, input])
            return { superAdmin: true }
        },
        async resolveDataScope(authorization, input) {
            calls.push(['resolveDataScope', authorization, input])
            return { all: false, includeSelf: true, organizationKeyIds: [1, 2] }
        },
        async resolveAuthorizedPrincipal(authorization, input) {
            calls.push(['resolveAuthorizedPrincipal', authorization, input])
            return authorizedPrincipal
        }
    }
    const service = createService(authClient, { gateway: { feign: { service_token: 'service-token' } } })

    assert.equal(await service.hasPermission('2281665656346656771', ['account:user:list']), true)
    assert.equal(await service.isSuperAdmin('2281665656346656771'), true)
    assert.deepEqual(await service.resolveDataScope('2281665656346656771', 'account:user'), {
        all: false,
        includeSelf: true,
        organizationKeyIds: [1, 2]
    })
    assert.deepEqual(await service.resolveAuthorizedPrincipal('2281665656346656771', ['account:user:list']), authorizedPrincipal)
    assert.deepEqual(calls, [
        ['checkPermission', 'Bearer service-token', { uid: '2281665656346656771', permissionCodes: ['account:user:list'] }],
        ['checkSuperAdmin', 'Bearer service-token', { uid: '2281665656346656771' }],
        ['resolveDataScope', 'Bearer service-token', { uid: '2281665656346656771', resourceCode: 'account:user' }],
        ['resolveAuthorizedPrincipal', 'Bearer service-token', { uid: '2281665656346656771', permissionCodes: ['account:user:list'] }]
    ])
})

test('AuthorizationService 缺少服务凭据时抛出 ServiceUnavailableException', async () => {
    const service = createService({}, {})
    await assert.rejects(() => service.hasPermission('1', ['account:user:list']), ServiceUnavailableException)
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
                async invalidatePermissionCache() {
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
            async checkPermission() {
                calls += 1
                return { allowed: true }
            }
        },
        { gateway: { feign: { service_token: 'service-token' } } }
    )
    const results = await Promise.all([
        service.hasPermission('2281665656346656771', ['account:user:list']),
        service.hasPermission('2281665656346656771', ['account:user:list']),
        service.hasPermission('2281665656346656771', ['account:user:list'])
    ])
    assert.deepEqual(results, [true, true, true])
    assert.equal(calls, 1)
    // 缓存未过期时后续查询继续复用同一次调用结果。
    assert.equal(await service.hasPermission('2281665656346656771', ['account:user:list']), true)
    assert.equal(calls, 1)
})

test('AuthorizationService 权限码顺序不同时命中同一份缓存', async () => {
    let calls = 0
    const service = createService(
        {
            async resolveAuthorizedPrincipal() {
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

test('AuthorizationService 查询失败不写入缓存', async () => {
    let calls = 0
    const service = createService(
        {
            async checkPermission() {
                calls += 1
                if (calls === 1) throw new Error('auth unavailable')
                return { allowed: true }
            }
        },
        { gateway: { feign: { service_token: 'service-token' } } }
    )
    await assert.rejects(() => service.hasPermission('2281665656346656771', ['account:user:list']), /auth unavailable/)
    assert.equal(await service.hasPermission('2281665656346656771', ['account:user:list']), true)
    assert.equal(calls, 2)
})

test('AuthorizationService 缓存失效后重新查询 Auth', async () => {
    let calls = 0
    const service = createService(
        {
            async checkPermission() {
                calls += 1
                return { allowed: true }
            },
            async invalidatePermissionCache() {
                return { success: true }
            }
        },
        { gateway: { feign: { service_token: 'service-token' } } }
    )
    await service.hasPermission('2281665656346656771', ['account:user:list'])
    await service.invalidate({ uids: ['2281665656346656771'] })
    await service.hasPermission('2281665656346656771', ['account:user:list'])
    assert.equal(calls, 2)
})
