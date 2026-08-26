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

function nacosOptions(overrides = {}) {
    return {
        serverAddr: 'nacos.internal:8848',
        namespace: 'example-namespace',
        username: 'example-user',
        password: 'example-password',
        requestTimeout: 5000,
        configDataId: 'chat-web-example-service.yaml',
        configGroup: 'EXAMPLE_CONFIG_GROUP',
        registerEnabled: true,
        registerRequired: true,
        serviceName: 'chat-web-example-service',
        discoveryGroup: 'EXAMPLE_DISCOVERY_GROUP',
        registerIp: '10.0.0.8',
        registerPort: 3020,
        ...overrides
    }
}

function nacosShadowConfig(overrides = {}) {
    return config({
        NACOS_SERVER: 'hidden.example:8848',
        NACOS_NAMESPACE: 'hidden-namespace',
        NACOS_USERNAME: 'hidden-user',
        NACOS_PASSWORD: 'hidden-password',
        NACOS_CONFIG_DATA_ID: 'hidden.yaml',
        NACOS_CONFIG_GROUP: 'HIDDEN_CONFIG_GROUP',
        NACOS_GROUP: 'HIDDEN_DISCOVERY_GROUP',
        NACOS_SERVICE_NAME: 'hidden-service',
        NACOS_REGISTER_ENABLED: true,
        NACOS_REGISTER_REQUIRED: false,
        NACOS_REGISTER_IP: '192.0.2.1',
        NACOS_REGISTER_PORT: 6553,
        'server.port': 6554,
        ...overrides
    })
}

function withPatchedNacosClients({ configContent = 'remoteOnly: applied', registrationError } = {}) {
    const nacosConfigModule = require('nacos-config')
    const nacosNamingModule = require('nacos-naming')
    const originalConfigClient = nacosConfigModule.NacosConfigClient
    const originalNamingClient = nacosNamingModule.NacosNamingClient
    const records = {
        configClientOptions: [],
        configGetConfigCalls: [],
        configSubscribeCalls: [],
        namingClientOptions: [],
        registerInstanceCalls: [],
        readyCalls: 0
    }

    class FakeNacosConfigClient {
        constructor(options) {
            this.options = options
            records.configClientOptions.push(options)
        }

        async getConfig(dataId, group) {
            records.configGetConfigCalls.push({ dataId, group })
            return configContent
        }

        subscribe(subscription, listener) {
            records.configSubscribeCalls.push(subscription)
            this.listener = listener
        }

        unSubscribe() {}

        close() {}
    }

    class FakeNacosNamingClient {
        constructor(options) {
            this.options = options
            records.namingClientOptions.push(options)
        }

        async ready() {
            records.readyCalls += 1
        }

        async registerInstance(serviceName, instance, group) {
            records.registerInstanceCalls.push({ serviceName, instance, group })
            if (registrationError) {
                throw registrationError
            }
        }

        async deregisterInstance() {}

        async close() {}
    }

    nacosConfigModule.NacosConfigClient = FakeNacosConfigClient
    nacosNamingModule.NacosNamingClient = FakeNacosNamingClient

    return {
        records,
        restore() {
            nacosConfigModule.NacosConfigClient = originalConfigClient
            nacosNamingModule.NacosNamingClient = originalNamingClient
        }
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

test('shared Nacos loadConfig and registerService use runtime options end-to-end', async () => {
    const reads = []
    const configServiceBase = nacosShadowConfig()
    const configService = {
        ...configServiceBase,
        get(key, fallback) {
            reads.push(key)
            return configServiceBase.get(key, fallback)
        }
    }
    const patched = withPatchedNacosClients({
        configContent: 'remoteOnly: applied\nloaded: true'
    })

    try {
        const service = new NacosService(
            configService,
            nacosOptions({
                configDataId: 'options.yaml',
                configGroup: 'OPTIONS_CONFIG_GROUP',
                serviceName: 'options-service',
                discoveryGroup: 'OPTIONS_DISCOVERY_GROUP',
                registerIp: '10.0.0.9',
                registerPort: 4020
            })
        )

        await service.loadConfig()
        await service.registerService()

        assert.deepEqual(reads, [])
        assert.deepEqual(patched.records.configClientOptions, [
            {
                serverAddr: 'nacos.internal:8848',
                namespace: 'example-namespace',
                username: 'example-user',
                password: 'example-password',
                requestTimeout: 5000
            }
        ])
        assert.deepEqual(patched.records.configGetConfigCalls, [{ dataId: 'options.yaml', group: 'OPTIONS_CONFIG_GROUP' }])
        assert.deepEqual(patched.records.configSubscribeCalls, [{ dataId: 'options.yaml', group: 'OPTIONS_CONFIG_GROUP' }])
        assert.equal(patched.records.namingClientOptions[0].serverList, 'nacos.internal:8848')
        assert.equal(patched.records.namingClientOptions[0].namespace, 'example-namespace')
        assert.equal(patched.records.namingClientOptions[0].username, 'example-user')
        assert.equal(patched.records.namingClientOptions[0].password, 'example-password')
        assert.equal(typeof patched.records.namingClientOptions[0].logger.log, 'function')
        assert.equal(typeof patched.records.namingClientOptions[0].logger.info, 'function')
        assert.equal(typeof patched.records.namingClientOptions[0].logger.debug, 'function')
        assert.deepEqual(patched.records.registerInstanceCalls, [
            {
                serviceName: 'options-service',
                instance: {
                    instanceId: '',
                    healthy: true,
                    enabled: true,
                    ephemeral: true,
                    ip: '10.0.0.9',
                    port: 4020
                },
                group: 'OPTIONS_DISCOVERY_GROUP'
            }
        ])
        assert.equal(configService.values.loaded, true)
        assert.equal(configService.values.remoteOnly, 'applied')
    } finally {
        patched.restore()
    }
})

test('shared Nacos registerService skips naming client construction when registration is disabled', async () => {
    const reads = []
    const configServiceBase = nacosShadowConfig({ NACOS_REGISTER_ENABLED: true })
    const configService = {
        ...configServiceBase,
        get(key, fallback) {
            reads.push(key)
            return configServiceBase.get(key, fallback)
        }
    }
    const patched = withPatchedNacosClients()

    try {
        const service = new NacosService(configService, nacosOptions({ registerEnabled: false }))

        await service.loadConfig()
        await service.registerService()

        assert.deepEqual(reads, [])
        assert.deepEqual(patched.records.namingClientOptions, [])
        assert.deepEqual(patched.records.registerInstanceCalls, [])
        assert.equal(patched.records.readyCalls, 0)
    } finally {
        patched.restore()
    }
})

test('shared Nacos registerService respects registerRequired after registration failures', async () => {
    const readsRequired = []
    const readsOptional = []
    const requiredBase = nacosShadowConfig({ NACOS_REGISTER_REQUIRED: false })
    const optionalBase = nacosShadowConfig({ NACOS_REGISTER_REQUIRED: true })
    const requiredConfigService = {
        ...requiredBase,
        get(key, fallback) {
            readsRequired.push(key)
            return requiredBase.get(key, fallback)
        }
    }
    const optionalConfigService = {
        ...optionalBase,
        get(key, fallback) {
            readsOptional.push(key)
            return optionalBase.get(key, fallback)
        }
    }
    const patched = withPatchedNacosClients({
        registrationError: new Error('simulated registration failure')
    })

    try {
        const requiredService = new NacosService(
            requiredConfigService,
            nacosOptions({ registerRequired: true, serviceName: 'required-service' })
        )
        const optionalService = new NacosService(
            optionalConfigService,
            nacosOptions({ registerRequired: false, serviceName: 'optional-service' })
        )

        await requiredService.loadConfig()
        await optionalService.loadConfig()

        assert.deepEqual(readsRequired, [])
        assert.deepEqual(readsOptional, [])
        await assert.rejects(() => requiredService.registerService(), /simulated registration failure/)
        await assert.doesNotReject(() => optionalService.registerService())
    } finally {
        patched.restore()
    }
})

test('shared Nacos runtime accepts requestTimeout and registerPort boundary values', () => {
    assert.doesNotThrow(() => new NacosService(config(), nacosOptions({ requestTimeout: 1 })))
    assert.doesNotThrow(() => new NacosService(config(), nacosOptions({ registerPort: 1 })))
    assert.doesNotThrow(() => new NacosService(config(), nacosOptions({ registerPort: 65535 })))
})

test('shared Nacos behavior resolves exclusively from runtime options', () => {
    const reads = []
    const baseConfig = nacosShadowConfig()
    const configService = {
        ...baseConfig,
        get(key, fallback) {
            reads.push(key)
            return baseConfig.get(key, fallback)
        }
    }
    const service = new NacosService(
        configService,
        nacosOptions({
            configDataId: 'options.yaml',
            configGroup: 'OPTIONS_CONFIG_GROUP',
            serviceName: 'options-service',
            discoveryGroup: 'OPTIONS_DISCOVERY_GROUP',
            registerIp: '10.0.0.9',
            registerPort: 4020
        })
    )

    assert.deepEqual(service.getConfigSubscription(), {
        dataId: 'options.yaml',
        group: 'OPTIONS_CONFIG_GROUP'
    })
    assert.equal(service.getServiceName(), 'options-service')
    assert.equal(service.getDiscoveryGroup(), 'OPTIONS_DISCOVERY_GROUP')
    assert.equal(service.resolveRegisterIp(), '10.0.0.9')
    assert.equal(service.getRegisterPort(), 4020)
    assert.deepEqual(reads, [])
})

test('shared Nacos configuration preserves explicit environment values', () => {
    const key = 'SHARED_RUNTIME_ENV_OVERRIDE'
    const previous = process.env[key]
    process.env[key] = 'environment'
    try {
        const configService = config()
        const service = new NacosService(configService, nacosOptions())
        service.applyRemoteConfig(`${key}: remote\nremoteOnly: applied`, '已加载', 'example.yaml', 'DEFAULT_GROUP', 'public')

        assert.equal(configService.get(key), undefined)
        assert.equal(configService.get('remoteOnly'), 'applied')
    } finally {
        if (previous === undefined) delete process.env[key]
        else process.env[key] = previous
    }
})

test('shared Nacos runtime rejects invalid required option strings', () => {
    for (const property of ['serverAddr', 'namespace', 'configDataId', 'configGroup', 'serviceName', 'discoveryGroup']) {
        for (const value of [undefined, null, 1, {}, '', '   ']) {
            assert.throws(
                () => new NacosService(config(), nacosOptions({ [property]: value })),
                new RegExp(`NacosRuntimeOptions\\.${property}`)
            )
        }
    }
})

test('shared Nacos runtime rejects invalid numeric options', () => {
    for (const requestTimeout of [0, -1, 1.5, Number.NaN]) {
        assert.throws(() => new NacosService(config(), nacosOptions({ requestTimeout })), /NacosRuntimeOptions\.requestTimeout/)
    }
    for (const registerPort of [0, 65536, 1.5, Number.NaN]) {
        assert.throws(() => new NacosService(config(), nacosOptions({ registerPort })), /NacosRuntimeOptions\.registerPort/)
    }
})

test('shared Nacos runtime rejects non-boolean registration options', () => {
    assert.throws(() => new NacosService(config(), nacosOptions({ registerEnabled: 'true' })), /NacosRuntimeOptions\.registerEnabled/)
    assert.throws(() => new NacosService(config(), nacosOptions({ registerRequired: 'false' })), /NacosRuntimeOptions\.registerRequired/)
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
