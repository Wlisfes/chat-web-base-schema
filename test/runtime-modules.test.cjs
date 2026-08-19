const assert = require('node:assert/strict')
const test = require('node:test')

const { AuthSessionService, TokenService } = require('../dist/src/runtime/auth')
const { createMysqlOptions } = require('../dist/src/runtime/database')
const { NacosService } = require('../dist/src/runtime/nacos')
const { RedisService } = require('../dist/src/runtime/redis')

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
