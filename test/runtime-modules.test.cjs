const assert = require('node:assert/strict')
const test = require('node:test')

const { BadGatewayException, RequestMethod, ServiceUnavailableException, UnauthorizedException } = require('@nestjs/common')
const { AuthClient, AuthSessionService, TokenService } = require('../dist/src/runtime/auth')
const { assertMysqlDatabaseIsolation, createMysqlOptions } = require('../dist/src/runtime/database')
const {
    FeignClient,
    FeignClientAccountManager,
    FeignClientFactory,
    FeignClientFinanceManager,
    FeignWebClient
} = require('../dist/src/feign')
const { PATH_METADATA, METHOD_METADATA, ROUTE_ARGS_METADATA } = require('@nestjs/common/constants')
const { forRootNacosRuntimeOptions, NACOS_RUNTIME_OPTIONS, NacosModule, NacosService } = require('../dist/src/runtime/nacos')
const { REDIS_RUNTIME_OPTIONS, RedisModule, RedisService } = require('../dist/src/runtime/redis')
const { runWithRequestContext } = require('../dist/src/utils/modules/request-context')

test('Feign 公共入口仅导出正式 Manager 命名', () => {
    const feign = require('../dist/src/feign')
    assert.equal(typeof feign.FeignClientAccountManager, 'function')
    assert.equal(typeof feign.FeignClientFinanceManager, 'function')
    assert.equal(typeof feign.FeignClientCrmManager, 'function')
    assert.equal(typeof feign.FeignClientSkylineManager, 'function')
})

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
        discoveryEnabled: true,
        discoveryRequired: false,
        configEnabled: true,
        configRequired: true,
        registerRequired: true,
        serviceName: 'chat-web-example-service',
        discoveryGroup: 'EXAMPLE_DISCOVERY_GROUP',
        registerIp: '10.0.0.8',
        registerPort: 3020,
        registerWeight: 1,
        ...overrides
    }
}

function minimalNacosOptions(overrides = {}) {
    return {
        serverAddr: 'nacos.internal:8848',
        namespace: 'example-namespace',
        serviceName: 'chat-web-minimal-service',
        registerPort: 3020,
        ...overrides
    }
}

function nacosRuntimeEnvironment(overrides = {}) {
    return {
        PORT: '3020',
        NACOS_SERVER: undefined,
        NACOS_NAMESPACE: undefined,
        NACOS_USERNAME: undefined,
        NACOS_PASSWORD: undefined,
        NACOS_REQUEST_TIMEOUT: undefined,
        NACOS_CONFIG_DATA_ID: undefined,
        NACOS_CONFIG_GROUP: undefined,
        NACOS_REGISTER_ENABLED: undefined,
        NACOS_DISCOVERY_ENABLED: undefined,
        NACOS_DISCOVERY_REQUIRED: undefined,
        NACOS_CONFIG_ENABLED: undefined,
        NACOS_CONFIG_REQUIRED: undefined,
        NACOS_REGISTER_REQUIRED: undefined,
        NACOS_SERVICE_NAME: 'chat-web-example-service',
        NACOS_GROUP: undefined,
        NACOS_REGISTER_IP: undefined,
        NACOS_REGISTER_PORT: undefined,
        NACOS_REGISTER_WEIGHT: undefined,
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

function withPatchedNacosClients({ configContent = 'remoteOnly: applied', registrationError, instances = [] } = {}) {
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
        deregisterInstanceCalls: [],
        getAllInstancesCalls: [],
        subscribeCalls: [],
        unsubscribeCalls: [],
        readyCalls: 0,
        namingCloseCalls: 0
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

        async deregisterInstance(serviceName, instance, group) {
            records.deregisterInstanceCalls.push({ serviceName, instance, group })
        }

        async getAllInstances(serviceName, group, clusters, subscribe) {
            records.getAllInstancesCalls.push({ serviceName, group, clusters, subscribe })
            return instances
        }

        subscribe(info, listener) {
            records.subscribeCalls.push(info)
            this.listener = listener
        }

        unSubscribe(info, listener) {
            records.unsubscribeCalls.push({ info, listener })
        }

        async _close() {
            records.namingCloseCalls += 1
        }
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
    return new AuthClient(factory.create(FeignClientAccountManager))
}

test('shared Feign account auth client forwards the bearer token and returns the principal', async () => {
    let request
    const service = accountAuthClient(
        {
            feign: { 'chat-web-account': { url: 'http://account.internal:3000', timeout: 3000 } }
        },
        async (url, init) => {
            request = { url, init }
            return new Response(
                JSON.stringify({ data: { uid: '2149446185344106496', sessionId: 'shared-auth-session' }, code: 200, message: '成功' }),
                { status: 200, headers: { 'content-type': 'application/json' } }
            )
        }
    )

    assert.deepEqual(await service.authenticateToken('account-token'), {
        uid: '2149446185344106496',
        sessionId: 'shared-auth-session'
    })
    assert.equal(String(request.url), 'http://account.internal:3000/feign/auth/token/introspect')
    assert.equal(request.init.method, 'GET')
    assert.equal(request.init.headers.get('authorization'), 'Bearer account-token')
})

test('shared Feign client can be inherited directly as a server route', async () => {
    class AccountFeignController extends FeignClientAccountManager {}
    const controller = new AccountFeignController(
        {
            async introspect(authorization) {
                return { authorization }
            }
        },
        config({ feign: { service_token: 'service-token' } })
    )
    const method = AccountFeignController.prototype.introspect
    assert.equal(Reflect.getMetadata(PATH_METADATA, method), '/feign/auth/token/introspect')
    assert.equal(Reflect.getMetadata(METHOD_METADATA, method), RequestMethod.GET)
    assert.equal(Reflect.getMetadata('auth:is-public', method), true)
    assert.equal(Reflect.getMetadata(ROUTE_ARGS_METADATA, AccountFeignController, 'introspect')['6:0'].data, 'authorization')
    assert.deepEqual(await controller.introspect('Bearer account-token'), { authorization: 'Bearer account-token' })
})

test('shared Feign server dispatch validates a configured service token when declared', async () => {
    class ServiceTokenController extends FeignWebClient {
        invoke(authorization) {
            return this.dispatch('invoke', authorization)
        }
    }
    FeignClient({
        name: '服务令牌测试服务',
        serviceTokenKey: 'feign.service_token',
        baseUrlConfigKey: 'feign.test.url',
        timeoutConfigKey: 'feign.test.timeout'
    })(ServiceTokenController)
    const controller = new ServiceTokenController(
        {
            async invoke(authorization) {
                return { authorization }
            }
        },
        config({ feign: { service_token: 'service-token' } })
    )

    assert.deepEqual(await controller.invoke('Bearer service-token'), { authorization: 'Bearer service-token' })
    assert.throws(() => controller.invoke('Bearer another-token'), UnauthorizedException)
})

test('shared account auth client preserves rejected-token semantics', async () => {
    const service = accountAuthClient(
        { feign: { 'chat-web-account': { url: 'http://account.internal:3000', timeout: 3000 } } },
        async () => {
            return new Response(JSON.stringify({ data: null, code: 401, message: '登录会话已失效' }), {
                status: 401,
                headers: { 'content-type': 'application/json' }
            })
        }
    )

    await assert.rejects(() => service.authenticateToken('expired-token'), UnauthorizedException)
})

test('shared account auth client distinguishes unavailable and invalid upstream responses', async () => {
    const unavailable = accountAuthClient(
        { feign: { 'chat-web-account': { url: 'http://account.internal:3000', timeout: 3000 } } },
        async () => {
            throw new Error('connect failed')
        }
    )
    const invalid = accountAuthClient(
        { feign: { 'chat-web-account': { url: 'http://account.internal:3000', timeout: 3000 } } },
        async () => new Response('not-json', { status: 200 })
    )

    await assert.rejects(() => unavailable.authenticateToken('account-token'), ServiceUnavailableException)
    await assert.rejects(() => invalid.authenticateToken('account-token'), BadGatewayException)
})

test('shared Feign client validates service URL and timeout settings', async () => {
    const invalidUrl = accountAuthClient(
        { feign: { 'chat-web-account': { url: 'redis://account', timeout: 3000 } } },
        async () => new Response()
    )
    const invalidTimeout = accountAuthClient(
        { feign: { 'chat-web-account': { url: 'http://account.internal:3000', timeout: 99 } } },
        async () => new Response()
    )

    await assert.rejects(() => invalidUrl.authenticateToken('account-token'), /http:\/\//)
    await assert.rejects(() => invalidTimeout.authenticateToken('account-token'), /100-30000/)
})

test('shared Feign client rejects legacy environment-style configuration keys', async () => {
    const service = accountAuthClient(
        { ACCOUNT_SERVICE_URL: 'http://account.internal:3000', ACCOUNT_AUTH_TIMEOUT_MS: 3000 },
        async () => new Response()
    )
    await assert.rejects(() => service.authenticateToken('account-token'), /Nacos 配置 feign\.chat-web-account\.url/)
})

test('shared Feign client validates required Nacos configuration during application bootstrap', () => {
    const missing = new FeignClientFactory(config(), async () => new Response())
    missing.create(FeignClientAccountManager)
    assert.throws(() => missing.onApplicationBootstrap(), /Nacos 配置 feign\.chat-web-account\.url/)

    const configured = new FeignClientFactory(
        config({ feign: { 'chat-web-account': { url: 'http://account.internal:3000', timeout: 3000 } } }),
        async () => new Response()
    )
    configured.create(FeignClientAccountManager)
    assert.doesNotThrow(() => configured.onApplicationBootstrap())
})

test('shared Feign finance client serializes currency exchange sync requests and responses', async () => {
    let request
    const factory = new FeignClientFactory(
        config({ feign: { 'chat-web-finance': { url: 'http://finance.internal:3010', timeout: 5000 } } }),
        async (url, init) => {
            request = { url: String(url), init }
            return new Response(
                JSON.stringify({
                    data: {
                        date: '2026-09-02',
                        count: 1,
                        list: [{ currency: 'CNY', rate: 7.2534, date: '2026-09-02' }]
                    },
                    code: 200,
                    message: '成功'
                }),
                { status: 200, headers: { 'content-type': 'application/json' } }
            )
        }
    )
    const service = factory.create(FeignClientFinanceManager)
    const input = { date: '2026-09-02', rates: [{ currency: 'CNY', rate: 7.2534 }] }

    const result = await service.httpSyncCurrencyExchange('Bearer finance-token', input)

    assert.equal(request.url, 'http://finance.internal:3010/feign/currency/exchange/sync')
    assert.equal(request.init.method, 'POST')
    assert.equal(request.init.headers.get('authorization'), 'Bearer finance-token')
    assert.deepEqual(JSON.parse(request.init.body), input)
    assert.deepEqual(result, {
        date: '2026-09-02',
        count: 1,
        list: [{ currency: 'CNY', rate: 7.2534, date: '2026-09-02' }]
    })
})

test('shared token service signs and verifies account access tokens', () => {
    const values = {
        'security.jwt.secret': '0123456789abcdef0123456789abcdef',
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
        () =>
            new TokenService(config({ ...values, 'security.jwt.secret': 'abcdef0123456789abcdef0123456789' })).verifyAccessToken(
                issued.accessToken
            ),
        /签名无效/
    )
})

test('shared token service rejects legacy JWT keys and missing Nacos fields', () => {
    const nacosJwt = {
        'security.jwt.secret': '0123456789abcdef0123456789abcdef',
        'security.jwt.issuer': 'chat-web-account-service',
        'security.jwt.audience': 'chat-web',
        'security.jwt.accessTokenTtlSeconds': 600
    }
    assert.throws(() => new TokenService(config({ JWT_SECRET: nacosJwt['security.jwt.secret'] })).issueAccessToken('1'), /Nacos 配置/)
    for (const field of Object.keys(nacosJwt)) {
        const values = { ...nacosJwt }
        delete values[field]
        assert.throws(() => new TokenService(config(values)).issueAccessToken('1'), /Nacos 配置/)
    }
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
    const service = new AuthSessionService(redis, config({ 'security.session.prefix': 'test:session' }))
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

test('shared auth session rejects the legacy environment-style prefix', async () => {
    const redis = { async setEx() {} }
    const service = new AuthSessionService(redis, config({ AUTH_SESSION_PREFIX: 'legacy:session' }))
    await assert.rejects(
        () => service.create({ sub: '1', iss: 'issuer', aud: 'audience', iat: 1, exp: Math.floor(Date.now() / 1000) + 60, jti: 'one' }),
        /Nacos 配置 security\.session\.prefix/
    )
})

test('shared Redis reads the nested Nacos redis node and enforces the service index', () => {
    const service = new RedisService(
        config({
            redis: {
                host: '127.0.0.1',
                port: 6379,
                database: 0,
                tls: false,
                connectTimeoutMs: 5000,
                username: 'account',
                password: '123456'
            }
        }),
        { database: 0 }
    )
    const url = new URL(service.getConnectionUrl())
    assert.equal(url.hostname, '127.0.0.1')
    assert.equal(url.port, '6379')
    assert.equal(url.pathname, '/0')
    assert.equal(url.password, '123456')
    assert.throws(
        () =>
            new RedisService(config({ redis: { host: '127.0.0.1', port: 6379, database: 1, tls: false, connectTimeoutMs: 5000 } }), {
                database: 0
            }).getConnectionUrl(),
        /本服务分配的 index：0/
    )
})

test('RedisModule injects its runtime options through forRoot', () => {
    const module = RedisModule.forRoot({ database: 1 })
    const provider = module.providers.find(candidate => candidate.provide === REDIS_RUNTIME_OPTIONS)
    assert.deepEqual(provider.useValue, { database: 1 })
})

test('shared Redis rejects missing required Nacos connection parameters', () => {
    for (const field of ['host', 'port', 'database']) {
        const redis = { host: '127.0.0.1', port: 6379, database: 0, tls: false, connectTimeoutMs: 5000 }
        delete redis[field]
        const service = new RedisService(config({ redis }), { database: 0 })
        assert.throws(() => service.getConnectionUrl(), /Redis 配置|Nacos Redis 配置/)
    }
    assert.doesNotThrow(() =>
        new RedisService(config({ redis: { host: '127.0.0.1', port: 6379, database: 0 } }), { database: 0 }).getConnectionUrl()
    )
    assert.throws(
        () =>
            new RedisService(config({ REDIS_HOST: 'redis.example', REDIS_PORT: 6379, REDIS_DATABASE: 0 }), {
                database: 0
            }).getConnectionUrl(),
        /缺少 Nacos Redis 配置节点/
    )
})

test('shared Redis readiness keeps the service boolean contract', async () => {
    const service = new RedisService(
        config({ redis: { host: 'redis.example', port: 6379, database: 0, tls: false, connectTimeoutMs: 5000 } }),
        { database: 0 }
    )
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
                registerPort: 4020,
                registerWeight: 10
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
                    port: 4020,
                    weight: 10
                },
                group: 'OPTIONS_DISCOVERY_GROUP'
            }
        ])
        assert.equal(configService.values.loaded, true)
        assert.equal(configService.values.remoteOnly, 'applied')
        await service.onModuleDestroy()
        assert.deepEqual(patched.records.deregisterInstanceCalls, [
            {
                serviceName: 'options-service',
                instance: {
                    instanceId: '',
                    healthy: true,
                    enabled: true,
                    ephemeral: true,
                    ip: '10.0.0.9',
                    port: 4020,
                    weight: 10
                },
                group: 'OPTIONS_DISCOVERY_GROUP'
            }
        ])
    } finally {
        patched.restore()
    }
})

test('shared Nacos discovery resolves weighted instances and owns subscriptions', async () => {
    const instances = [
        { instanceId: 'heavy', ip: '10.0.0.10', port: 5010, weight: 3, healthy: true, enabled: true, metadata: {} },
        { instanceId: 'light', ip: '10.0.0.11', port: 5010, weight: 1, healthy: true, enabled: true, metadata: {} }
    ]
    const patched = withPatchedNacosClients({ configContent: 'gateway: {}', instances })

    try {
        const service = new NacosService(config(), nacosOptions({ registerEnabled: false }))
        await service.onModuleInit()

        const counts = { heavy: 0, light: 0 }
        for (let index = 0; index < 40; index += 1) {
            const target = await service.resolveService('chat-web-account-service', 'http://fallback:5010')
            counts[target.includes('10.0.0.10') ? 'heavy' : 'light'] += 1
        }

        assert.deepEqual(counts, { heavy: 30, light: 10 })
        assert.equal(service.getHealthyInstanceCount('chat-web-account-service'), 2)
        assert.equal(patched.records.getAllInstancesCalls.length, 1)
        assert.deepEqual(patched.records.getAllInstancesCalls[0], {
            serviceName: 'chat-web-account-service',
            group: 'EXAMPLE_DISCOVERY_GROUP',
            clusters: '',
            subscribe: false
        })
        assert.deepEqual(patched.records.subscribeCalls, [
            { serviceName: 'chat-web-account-service', groupName: 'EXAMPLE_DISCOVERY_GROUP' }
        ])
        assert.equal(service.getStatus().connected, true)
        await service.onModuleDestroy()
        assert.equal(patched.records.unsubscribeCalls.length, 1)
        assert.equal(patched.records.namingCloseCalls, 1)
    } finally {
        patched.restore()
    }
})

test('shared Nacos discovery disabled returns the supplied fallback without opening a naming client', async () => {
    const patched = withPatchedNacosClients({ configContent: 'remoteOnly: applied' })

    try {
        const service = new NacosService(config(), minimalNacosOptions({ discoveryEnabled: false, registerEnabled: false }))
        await service.onModuleInit()
        assert.equal(await service.resolveService('example-service', 'http://fallback:3020'), 'http://fallback:3020')
        assert.deepEqual(patched.records.namingClientOptions, [])
        assert.equal(service.getHealthyInstanceCount('example-service'), 0)
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

test('shared Nacos runtime accepts requestTimeout, registerPort and registerWeight boundary values', () => {
    assert.doesNotThrow(() => new NacosService(config(), nacosOptions({ requestTimeout: 1 })))
    assert.doesNotThrow(() => new NacosService(config(), nacosOptions({ registerPort: 1 })))
    assert.doesNotThrow(() => new NacosService(config(), nacosOptions({ registerPort: 65535 })))
    assert.doesNotThrow(() => new NacosService(config(), nacosOptions({ registerWeight: 0.5 })))
    assert.doesNotThrow(() => new NacosService(config(), nacosOptions({ registerWeight: 10000 })))
})

test('shared Nacos runtime supplies documented defaults for optional options', () => {
    const service = new NacosService(config(), minimalNacosOptions())

    assert.deepEqual(service.options, {
        serverAddr: 'nacos.internal:8848',
        namespace: 'example-namespace',
        username: undefined,
        password: undefined,
        requestTimeout: 5000,
        configDataId: 'chat-web-minimal-service.yaml',
        configGroup: 'DEFAULT_GROUP',
        registerEnabled: true,
        discoveryEnabled: true,
        discoveryRequired: false,
        configEnabled: true,
        configRequired: true,
        registerRequired: false,
        serviceName: 'chat-web-minimal-service',
        discoveryGroup: 'DEFAULT_GROUP',
        registerIp: undefined,
        registerPort: 3020,
        registerWeight: 1
    })

    const customGroupService = new NacosService(config(), minimalNacosOptions({ configGroup: 'CUSTOM_GROUP' }))
    assert.equal(customGroupService.getDiscoveryGroup(), 'CUSTOM_GROUP')

    const registrationDisabledService = new NacosService(config(), minimalNacosOptions({ registerEnabled: false }))
    assert.equal(registrationDisabledService.options.discoveryEnabled, false)
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

test('shared Nacos configuration always applies remote values', () => {
    const key = 'SHARED_RUNTIME_ENV_OVERRIDE'
    const previous = process.env[key]
    process.env[key] = 'environment'
    try {
        const configService = config()
        const service = new NacosService(configService, nacosOptions())
        service.applyRemoteConfig(`${key}: remote\nremoteOnly: applied`, '已加载', 'example.yaml', 'DEFAULT_GROUP', 'public')

        assert.equal(configService.get(key), 'remote')
        assert.equal(configService.get('remoteOnly'), 'applied')
    } finally {
        if (previous === undefined) delete process.env[key]
        else process.env[key] = previous
    }
})

test('shared Nacos runtime rejects invalid required option strings', () => {
    for (const property of ['serverAddr', 'namespace', 'serviceName']) {
        for (const value of [undefined, null, 1, {}, '', '   ']) {
            assert.throws(
                () => new NacosService(config(), nacosOptions({ [property]: value })),
                new RegExp(`NacosRuntimeOptions\\.${property}`)
            )
        }
    }
})

test('shared Nacos runtime rejects invalid provided optional strings', () => {
    for (const property of ['configDataId', 'configGroup', 'discoveryGroup']) {
        for (const value of [null, 1, {}, '', '   ']) {
            assert.throws(
                () => new NacosService(config(), minimalNacosOptions({ [property]: value })),
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
    for (const registerWeight of [0, -1, 10001, Number.NaN, Number.POSITIVE_INFINITY, '10']) {
        assert.throws(() => new NacosService(config(), nacosOptions({ registerWeight })), /NacosRuntimeOptions\.registerWeight/)
    }
})

test('shared Nacos runtime rejects non-boolean registration options', () => {
    assert.throws(() => new NacosService(config(), nacosOptions({ registerEnabled: 'true' })), /NacosRuntimeOptions\.registerEnabled/)
    assert.throws(() => new NacosService(config(), nacosOptions({ registerRequired: 'false' })), /NacosRuntimeOptions\.registerRequired/)
})

test('shared Nacos environment adapter only maps Nacos connection settings', () => {
    assert.deepEqual(
        forRootNacosRuntimeOptions(
            nacosRuntimeEnvironment({
                NACOS_SERVER: 'nacos.internal:8848',
                NACOS_NAMESPACE: 'example-namespace',
                NACOS_USERNAME: 'example-user',
                NACOS_PASSWORD: 'example-password',
                NACOS_CONFIG_DATA_ID: 'example.yaml',
                NACOS_CONFIG_GROUP: 'EXAMPLE_CONFIG',
                NACOS_SERVICE_NAME: 'example-custom',
                NACOS_REGISTER_ENABLED: 'false',
                NACOS_REGISTER_PORT: '4020'
            })
        ),
        {
            serverAddr: 'nacos.internal:8848',
            namespace: 'example-namespace',
            username: 'example-user',
            password: 'example-password',
            configDataId: 'example.yaml',
            configGroup: 'EXAMPLE_CONFIG',
            serviceName: 'example-custom',
            registerPort: 3020
        }
    )
})

test('shared Nacos environment adapter requires PORT, service name, server and namespace', () => {
    assert.deepEqual(
        forRootNacosRuntimeOptions({
            PORT: '3020',
            NACOS_SERVER: 'nacos:8848',
            NACOS_NAMESPACE: 'example',
            NACOS_SERVICE_NAME: 'chat-web-example-service'
        }),
        {
            serverAddr: 'nacos:8848',
            namespace: 'example',
            username: undefined,
            password: undefined,
            configDataId: undefined,
            configGroup: undefined,
            serviceName: 'chat-web-example-service',
            registerPort: 3020
        }
    )
    assert.equal(
        forRootNacosRuntimeOptions(nacosRuntimeEnvironment({ NACOS_SERVER: 'nacos:8848', NACOS_NAMESPACE: 'example', PORT: '4020' }))
            .registerPort,
        4020
    )
    assert.throws(() => forRootNacosRuntimeOptions(nacosRuntimeEnvironment({ NACOS_NAMESPACE: 'example' })), /NACOS_SERVER/)
    assert.throws(
        () =>
            forRootNacosRuntimeOptions(
                nacosRuntimeEnvironment({
                    PORT: undefined,
                    NACOS_SERVER: 'nacos:8848',
                    NACOS_NAMESPACE: 'example'
                })
            ),
        /PORT/
    )
    assert.equal(
        forRootNacosRuntimeOptions(
            nacosRuntimeEnvironment({ NACOS_SERVER: 'nacos:8848', NACOS_NAMESPACE: 'example', NACOS_REGISTER_PORT: '65536' })
        ).registerPort,
        3020
    )
})

test('NacosModule receives the complete runtime contract from the environment adapter', () => {
    const options = forRootNacosRuntimeOptions(
        nacosRuntimeEnvironment({ NACOS_SERVER: 'nacos.internal:8848', NACOS_NAMESPACE: 'example-namespace' })
    )
    const module = NacosModule.forRoot(options)
    const provider = module.providers.find(candidate => candidate.provide === NACOS_RUNTIME_OPTIONS)
    assert.equal(provider.useValue, options)
})

test('NacosModule accepts an explicitly complete runtime contract', () => {
    const options = {
        serverAddr: 'nacos.internal:8848',
        namespace: 'example-namespace',
        serviceName: 'chat-web-example-service',
        registerPort: 3020
    }
    const module = NacosModule.forRoot(options)
    const provider = module.providers.find(candidate => candidate.provide === NACOS_RUNTIME_OPTIONS)
    assert.equal(provider.useValue, options)
})

test('shared MySQL options read connection parameters only from Nacos', () => {
    const options = createMysqlOptions(
        config({
            'database.example': {
                host: 'mysql',
                port: 3306,
                username: 'service',
                password: 'secret',
                database: 'example',
                charset: 'utf8mb4',
                timezone: '+08:00',
                logging: false,
                poolSize: 10,
                connectTimeout: 10000,
                retryAttempts: 5,
                retryDelay: 3000
            },
            EXAMPLE_MYSQL_HOST: '127.0.0.1',
            EXAMPLE_MYSQL_USERNAME: 'ignored'
        }),
        {
            configKey: 'database.example',
            entities: [],
            decimalNumbers: true
        }
    )

    assert.equal(options.host, 'mysql')
    assert.equal(options.username, 'service')
    assert.equal(options.synchronize, false)
    assert.equal(options.migrationsRun, false)
    assert.deepEqual(options.extra, { decimalNumbers: true })
})

test('shared MySQL options reject the legacy name field', () => {
    assert.throws(
        () =>
            createMysqlOptions(
                config({
                    'database.example': {
                        host: 'mysql',
                        port: 3306,
                        username: 'service',
                        password: 'secret',
                        name: 'example',
                        charset: 'utf8mb4',
                        timezone: '+08:00',
                        logging: false,
                        poolSize: 10,
                        connectTimeout: 10000,
                        retryAttempts: 5,
                        retryDelay: 3000
                    }
                }),
                { configKey: 'database.example', entities: [] }
            ),
        /database\.example\.database/
    )
})

test('shared MySQL options reject missing required Nacos connection parameters', () => {
    for (const field of ['host', 'port', 'username', 'password', 'database']) {
        const database = {
            host: 'mysql',
            port: 3306,
            username: 'service',
            password: 'secret',
            database: 'example',
            charset: 'utf8mb4',
            timezone: '+08:00',
            logging: false,
            poolSize: 10,
            connectTimeout: 10000,
            retryAttempts: 5,
            retryDelay: 3000
        }
        delete database[field]
        assert.throws(
            () => createMysqlOptions(config({ 'database.example': database }), { configKey: 'database.example', entities: [] }),
            /数据库配置/
        )
    }
})

test('shared MySQL options allow omitted optional connection tuning fields', () => {
    const options = createMysqlOptions(
        config({
            'database.example': {
                host: 'mysql',
                port: 3306,
                username: 'service',
                password: 'secret',
                database: 'example'
            }
        }),
        { configKey: 'database.example', entities: [] }
    )

    assert.equal(options.charset, undefined)
    assert.equal(options.timezone, undefined)
    assert.equal(options.logging, undefined)
    assert.equal(options.poolSize, undefined)
    assert.equal(options.connectTimeout, undefined)
    assert.equal(options.retryAttempts, undefined)
    assert.equal(options.retryDelay, undefined)
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
