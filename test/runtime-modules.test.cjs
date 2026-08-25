const assert = require('node:assert/strict')
const test = require('node:test')

const { BadGatewayException, ServiceUnavailableException, UnauthorizedException } = require('@nestjs/common')
const { AccountAuthClient, AuthSessionService, TokenService } = require('../dist/src/runtime/auth')
const { assertMysqlDatabaseIsolation, createMysqlOptions } = require('../dist/src/runtime/database')
const { AccountFeignClient, FeignClientFactory, FinanceFeignClient } = require('../dist/src/runtime/feign')
const { NacosService } = require('../dist/src/runtime/nacos')
const { RedisService } = require('../dist/src/runtime/redis')
const { runWithRequestContext } = require('../dist/src/utils/modules/request-context')

function config(initial = {}) {
    const values = { ...initial }
    return {
        get(key, fallback) {
            return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback
        },
        set(key, value) {
            values[key] = value
        },
        values
    }
}

function accountAuthClient(values, fetchClient) {
    const factory = new FeignClientFactory(config(values), fetchClient)
    return new AccountAuthClient(factory.create(AccountFeignClient))
}

test('shared Feign account auth client forwards the bearer token and returns the principal', async () => {
    let request
    const service = accountAuthClient({ ACCOUNT_SERVICE_URL: 'http://account.internal:3000' }, async (url, init) => {
        request = { url, init }
        return new Response(
            JSON.stringify({ data: { uid: '2149446185344106496', sessionId: 'shared-auth-session' }, code: 200, message: '成功' }),
            { status: 200, headers: { 'content-type': 'application/json' } }
        )
    })

    assert.deepEqual(await service.authenticateToken('account-token'), {
        uid: '2149446185344106496',
        sessionId: 'shared-auth-session'
    })
    assert.equal(String(request.url), 'http://account.internal:3000/auth/token/introspect')
    assert.equal(request.init.method, 'GET')
    assert.equal(request.init.headers.get('authorization'), 'Bearer account-token')
})

test('shared account auth client preserves rejected-token semantics', async () => {
    const service = accountAuthClient({}, async () => {
        return new Response(JSON.stringify({ data: null, code: 401, message: '登录会话已失效' }), {
            status: 401,
            headers: { 'content-type': 'application/json' }
        })
    })

    await assert.rejects(() => service.authenticateToken('expired-token'), UnauthorizedException)
})

test('shared account auth client distinguishes unavailable and invalid upstream responses', async () => {
    const unavailable = accountAuthClient({}, async () => {
        throw new Error('connect failed')
    })
    const invalid = accountAuthClient({}, async () => new Response('not-json', { status: 200 }))

    await assert.rejects(() => unavailable.authenticateToken('account-token'), ServiceUnavailableException)
    await assert.rejects(() => invalid.authenticateToken('account-token'), BadGatewayException)
})

test('shared Feign client validates service URL and timeout settings', async () => {
    const invalidUrl = accountAuthClient({ ACCOUNT_SERVICE_URL: 'redis://account' }, async () => new Response())
    const invalidTimeout = accountAuthClient({ ACCOUNT_AUTH_TIMEOUT_MS: 99 }, async () => new Response())

    await assert.rejects(() => invalidUrl.authenticateToken('account-token'), /http:\/\//)
    await assert.rejects(() => invalidTimeout.authenticateToken('account-token'), /100-30000/)
})

test('shared Feign finance client serializes POST body, headers and GET query', async () => {
    const requests = []
    const factory = new FeignClientFactory(config({ FINANCE_SERVICE_URL: 'http://finance.internal:3010' }), async (url, init) => {
        requests.push({ url: String(url), init })
        const data = requests.length === 1 ? [{ countryKeyId: 1, upUsd: 100, downUsd: 80 }] : { currency: 'USD', rate: 1 }
        return new Response(JSON.stringify({ data, code: 200, message: '成功' }), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        })
    })
    const service = factory.create(FinanceFeignClient)

    await runWithRequestContext('finance-request-1', () => service.batchSmsRates('Bearer account-token', { countryKeyIds: [1, 2] }))
    await service.resolveCurrencyExchange('Bearer account-token', 'USD')

    assert.equal(requests[0].url, 'http://finance.internal:3010/rates/sms/batch')
    assert.equal(requests[0].init.method, 'POST')
    assert.equal(requests[0].init.headers.get('authorization'), 'Bearer account-token')
    assert.equal(requests[0].init.headers.get('x-request-id'), 'finance-request-1')
    assert.deepEqual(JSON.parse(requests[0].init.body), { countryKeyIds: [1, 2] })
    assert.equal(requests[1].url, 'http://finance.internal:3010/currency/exchange/resolver?currency=USD')
    assert.equal(requests[1].init.method, 'GET')
})

test('shared token service signs and verifies account access tokens', () => {
    const values = {
        JWT_SECRET: '0123456789abcdef0123456789abcdef',
        'security.jwt.issuer': 'chat-web-account-service',
        'security.jwt.audience': 'chat-web',
        'security.jwt.accessTokenTtlSeconds': 600
    }
    const service = new TokenService(config(values))
    const issued = service.issueAccessToken('123456789')

    assert.equal(service.verifyAccessToken(issued.accessToken).sub, '123456789')
    assert.equal(issued.tokenType, 'Bearer')
    assert.equal(issued.expiresIn, 600)
    assert.throws(
        () => new TokenService(config({ ...values, JWT_SECRET: 'abcdef0123456789abcdef0123456789' })).verifyAccessToken(issued.accessToken),
        /签名无效/
    )
})

test('shared auth session supports create, rotate and revoke', async () => {
    const values = new Map()
    const redis = {
        async get(key) {
            return values.get(key) ?? null
        },
        async setEx(key, _seconds, value) {
            values.set(key, value)
        },
        async rotate(oldKey, newKey, _seconds, value) {
            values.set(newKey, value)
            values.delete(oldKey)
        },
        async del(key) {
            values.delete(key)
        }
    }
    const service = new AuthSessionService(redis, config({ AUTH_SESSION_PREFIX: 'test:session' }))
    const first = { sub: '42', iss: 'issuer', aud: 'audience', iat: 1, exp: Math.floor(Date.now() / 1000) + 60, jti: 'first' }
    const second = { ...first, jti: 'second' }

    await service.create(first)
    await service.assertActive(first)
    await service.rotate(first.jti, second)
    await assert.rejects(() => service.assertActive(first), /会话已失效/)
    await service.assertActive(second)
    await service.revoke(second.jti)
    await assert.rejects(() => service.assertActive(second), /会话已失效/)
})

test('shared Redis URL parser merges explicit credentials', () => {
    const service = new RedisService(
        config({
            REDIS_URL: 'redis://redis.example:6379/2',
            REDIS_USERNAME: 'account',
            REDIS_PASSWORD: 'secret'
        })
    )
    const url = new URL(service.getConnectionUrl())

    assert.equal(url.username, 'account')
    assert.equal(url.password, 'secret')
    assert.equal(url.pathname, '/2')
})

test('explicit Redis database overrides the database embedded in REDIS_URL', () => {
    const service = new RedisService(
        config({
            REDIS_URL: 'rediss://account:secret@redis.example:6379/0',
            REDIS_DATABASE: 6
        })
    )
    const url = new URL(service.getConnectionUrl())

    assert.equal(url.protocol, 'rediss:')
    assert.equal(url.username, 'account')
    assert.equal(url.password, 'secret')
    assert.equal(url.pathname, '/6')
})

test('shared Redis readiness keeps the service boolean contract', async () => {
    const service = new RedisService(config({ REDIS_URL: 'redis://redis.example:6379/0' }))
    service.client = {
        isReady: true,
        async ping() {
            return 'PONG'
        }
    }
    assert.equal(await service.ping(), true)
    service.client = {
        isReady: false,
        async ping() {
            throw new Error('should not ping a disconnected client')
        }
    }
    assert.equal(await service.ping(), false)
})

test('shared Nacos configuration preserves explicit environment values', () => {
    const key = 'SHARED_RUNTIME_ENV_OVERRIDE'
    const previous = process.env[key]
    process.env[key] = 'environment'
    try {
        const configService = config()
        const service = new NacosService(configService, { serviceName: 'example', defaultPort: 3020 })
        service.applyRemoteConfig(`${key}: remote\nremoteOnly: applied`, '已加载', 'example.yaml', 'DEFAULT_GROUP', 'public')

        assert.equal(configService.get(key), undefined)
        assert.equal(configService.get('remoteOnly'), 'applied')
    } finally {
        if (previous === undefined) delete process.env[key]
        else process.env[key] = previous
    }
})

test('shared MySQL options apply only allowlisted environment overrides', () => {
    const options = createMysqlOptions(
        config({
            'database.example': {
                host: 'mysql',
                port: 3306,
                username: 'service',
                password: 'secret',
                name: 'example',
                logging: false
            },
            EXAMPLE_MYSQL_HOST: '127.0.0.1',
            EXAMPLE_MYSQL_USERNAME: 'ignored'
        }),
        {
            configKey: 'database.example',
            entities: [],
            environmentPrefix: 'EXAMPLE_MYSQL',
            environmentOverrides: ['host'],
            decimalNumbers: true
        }
    )

    assert.equal(options.host, '127.0.0.1')
    assert.equal(options.username, 'service')
    assert.equal(options.synchronize, false)
    assert.equal(options.migrationsRun, false)
    assert.deepEqual(options.extra, { decimalNumbers: true })
})

test('shared MySQL grant validation only permits the service database', () => {
    assert.doesNotThrow(() =>
        assertMysqlDatabaseIsolation(
            [
                'GRANT USAGE ON *.* TO `finance`@`%`',
                'GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON `chat-web-finance`.* TO `finance`@`%`'
            ],
            'chat-web-finance'
        )
    )
    assert.throws(
        () => assertMysqlDatabaseIsolation(['GRANT SELECT ON `chat-web-account`.* TO `finance`@`%`'], 'chat-web-finance'),
        /只能访问数据库/
    )
    assert.throws(() => assertMysqlDatabaseIsolation(['GRANT SELECT ON *.* TO `finance`@`%`'], 'chat-web-finance'), /全局权限/)
    assert.throws(() => assertMysqlDatabaseIsolation(['GRANT `shared_role`@`%` TO `finance`@`%`'], 'chat-web-finance'), /角色/)
})
