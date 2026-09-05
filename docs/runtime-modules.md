# Shared runtime modules

The runtime modules are exported as isolated subpaths. Importing the package
root does not load Redis, Nacos or database adapters.

## Redis

`RedisModule` owns connection parsing, lifecycle hooks and the common commands
used by authentication sessions. Each owning service supplies its isolated
Redis database index through `forRoot`; the connection is then read from the
`redis` node in that service's Nacos Data ID. Client creation is deferred until
application bootstrap, after `NacosService` has loaded remote configuration.
Redis connection parameters are read only from Nacos; no `REDIS_*` environment
override is supported.

```ts
import { RedisModule, RedisService } from '@wlisfes/chat-web-base-schema/redis'

@Module({
    imports: [RedisModule.forRoot({ database: 1 })]
})
export class AppModule {}
```

The Nacos node uses this shape. `host`, `port` and `database` are required;
`database` must match the index assigned to the service. `username`,
`password`, `tls` and `connectTimeoutMs` are optional. Omitted optional fields
are left to the Redis client defaults.

```yaml
redis:
    host: '127.0.0.1'
    port: 6379
    database: 0
    tls: false
    connectTimeoutMs: 5000
    password: '123456'
```

## Nacos

Pass `process.env` directly to the environment adapter, then register the
shared module with the complete runtime options.

```ts
import 'dotenv/config'
import { forRootNacosRuntimeOptions, NacosModule } from '@wlisfes/chat-web-base-schema/nacos'

NacosModule.forRoot(forRootNacosRuntimeOptions(process.env))
```

`forRootNacosRuntimeOptions` 负责从 `process.env` 转换和校验 Nacos 启动参数。`PORT`、`NACOS_SERVICE_NAME`、`NACOS_SERVER` 与 `NACOS_NAMESPACE` 必填；注册、发现、超时和业务配置不再从环境变量读取。由于 `AppModule` 装饰器会在 `ConfigModule.forRoot()` 初始化前执行，入口文件应先加载 `dotenv/config`；容器环境则直接使用注入的环境变量。

HTTP 监听和 Nacos 实例注册统一使用 `PORT`，不再根据运行环境切换到 `server.port` 或 `NACOS_REGISTER_PORT`。
服务 `.env` 只保留 `NODE_ENV`、`PORT` 以及 `NACOS_SERVER`、
`NACOS_NAMESPACE`、`NACOS_USERNAME`、`NACOS_PASSWORD`、
`NACOS_SERVICE_NAME`、`NACOS_CONFIG_DATA_ID`、`NACOS_CONFIG_GROUP` 这些
Nacos 连接与订阅参数。

`NacosService` reads every Nacos client, subscription and registration value
from this options object. It does not resolve `NACOS_*` or `server.port`
through `ConfigService`. Optional overrides and their defaults are:
These are transport-level defaults for the Nacos client itself; business
configuration loaded from the Data ID has no fallback source.

- `requestTimeout`: `5000` milliseconds.
- `configDataId`: `${serviceName}.yaml`.
- `configGroup`: `DEFAULT_GROUP`.
- `registerEnabled`: `true`.
- `configEnabled`: `true`.
- `configRequired`: `true`; set it to `false` when the caller has an explicit
  fallback configuration and should continue without Nacos Config.
- `discoveryEnabled`: follows `registerEnabled` (and is `true` when the
  registration option is omitted); set it explicitly to `true` for a
  discovery-only consumer.
- `discoveryRequired`: `false`; when disabled or unavailable, discovery callers
  can use their own fallback address.
- `registerRequired`: `false`.
- `discoveryGroup`: the resolved `configGroup`.
- `username`, `password`: omitted.
- `registerIp`: the first non-internal IPv4 interface, falling back to `127.0.0.1`.
- `registerWeight`: `1`. Configure this only in the explicit runtime options
  object when weighted registration is required.

`NacosService.loadConfig()` can be awaited by asynchronous database factories
before opening their connections. The same service owns the naming client and
exposes `resolveService()`, `refreshSubscriptions()`,
`getHealthyInstanceCount()`, `subscribeService()` and `unsubscribeService()`
for gateways or other infrastructure modules; consumers do not need to create
another Nacos client. It also registers and deregisters an ephemeral Nacos
instance. Remote Nacos values are the only source for business configuration;
matching process environment variables never override them.

## Authentication

The auth subpath exports the HS256 token codec, Redis session lifecycle,
Bearer guard, password digest service, internal-credential guard, request
principal types and decorators.

`chat-web-auth-service` owns authentication. It imports `SessionAuthModule` from
the `auth-session` subpath to verify JWTs and access the login session store,
adds login, captcha and user-status logic on top, and exposes the internal
introspection endpoint `POST /internal/auth/token/introspect` guarded by
`InternalAuthGuard`.

The `auth-session` subpath is reserved for that owning service: it touches the
session store and therefore requires the Redis client dependency. Business
services import only the `auth` subpath, which has no session or Redis
dependency at all.

Business services must not hold the JWT secret or read the login session store.
Import `AuthModule` to validate Bearer tokens through the auth service internal
introspection protocol and attach the returned principal to the request.

```ts
import { AuthModule, JwtAuthGuard } from '@wlisfes/chat-web-base-schema/auth'

@Module({
    imports: [AuthModule],
    providers: [{ provide: APP_GUARD, useExisting: JwtAuthGuard }]
})
export class AppModule {}
```

`AuthInternalClient` reads `feign.chat-web-auth.url`,
`feign.chat-web-auth.timeout` and `feign.service_token` from Nacos. The user
token travels in the request body and the caller identity travels in
`X-Service-Token`, so authentication is never registered as a business Feign
client and the internal route is never published through the gateway.

The owning auth service must provide `security.jwt.secret`,
`security.jwt.issuer`, `security.jwt.audience`,
`security.jwt.accessTokenTtlSeconds` and `security.session.prefix` in Nacos.
Legacy `JWT_SECRET` and `AUTH_SESSION_PREFIX` keys are not read.

`PasswordService` is shared because the auth service verifies password digests
during login while the account service generates them when creating accounts and
resetting passwords; both sides must use identical scrypt parameters.

## Declarative Feign clients

Cross-service HTTP calls use the shared declarative Feign runtime. A client class only declares the service address, request method, path and parameter bindings; `FeignModule` supplies the HTTP proxy implementation and consistently handles timeouts, Bearer headers, response envelopes and upstream errors.

```ts
@FeignClient({
    name: '账号服务',
    prefix: 'feign',
    serviceTokenKey: 'feign.service_token',
    baseUrlConfigKey: 'feign.chat-web-account.url',
    timeoutConfigKey: 'feign.chat-web-account.timeout'
})
export class FeignClientAccountManager extends FeignWebClient<FeignClientAccountImplementation> {
    @FeignGet('/consumer/resolver')
    async resolveConsumer(
        @FeignHeader('authorization') _authorization: string,
        @FeignQuery('keyId') _keyId: number
    ): Promise<AccountConsumer> {
        return this.dispatch('resolveConsumer', _authorization, _keyId)
    }
}

@Module({
    imports: [FeignModule.register([FeignClientAccountManager])]
})
export class IntegrationModule {}
```

Use `@FeignGet` with query parameters and `@FeignPost` with one `@FeignBody`. Multi-select fields remain arrays in the POST body. Business services must not create their own `fetch`, Axios or cross-database implementation for an endpoint already declared by a shared Feign client.
Every declared Feign URL and timeout is required in the service's Nacos `feign`
node. Environment-style `*_SERVICE_URL` and `*_TIMEOUT_MS` keys are not read,
and the shared clients do not provide fallback addresses or timeouts.
Business Feign clients always set `serviceTokenKey`; the Authorization position
carries the caller service credential, not an end-user token. Callers build that
header with `resolveFeignServiceAuthorization(configService)` so cross-service
base queries are not subject to permission codes or data-scope filtering.
Access-token introspection is not a business Feign concern and is served by the
auth service internal protocol instead.
When a client exposes internal routes, set `prefix: 'feign'` to apply the same
`/feign` prefix to outgoing requests and inherited server routes.

The same client declaration can be used as the owning service's Controller contract.
`@FeignGet`/`@FeignPost` and the parameter decorators also apply the Nest route metadata,
so a server only inherits the client and supplies an implementation in its constructor;
it does not repeat route, header, query or Swagger decorators:

```ts
@ApifoxController('内部 Feign 接口')
export class FeignController extends FeignClientAccountManager {
    constructor(implementation: FeignClientAccountImplementation, configService: ConfigService) {
        super(implementation, configService)
    }
}
```

`FeignClientBase` performs the small delegation needed by an inherited server method.
`FeignModule.register` remains the caller-side proxy factory; it is not required by the
owning Controller. This keeps the shared client declaration as the single source of truth
for both HTTP callers and server routes.

## Readable logging and trace correlation

Use the shared readable logger during Nest application creation. Local request
JSON is indented for terminal reading, while `NODE_ENV=production` compacts the
request JSON to one physical line for Dozzle. The colored text header is kept in
both environments.

```ts
import { ReadableConsoleLogger, createRequestLoggingMiddleware } from '@wlisfes/chat-web-base-schema/logging'

const serviceName = 'chat-web-example-service'
const logger = new ReadableConsoleLogger({ NODE_ENV: process.env.NODE_ENV, prefix: serviceName })
const app = await NestFactory.create(AppModule, { logger })
app.use(createRequestLoggingMiddleware(serviceName))
```

Register `requestContextMiddleware` before `createRequestLoggingMiddleware`.
The request logging middleware only accepts the service name and applies the
shared ignored path and payload length defaults.
The request context accepts a valid incoming `x-request-id`, creates one when it
is absent, returns it in the response and forwards it through shared Feign
clients. `getActiveTraceContext()` from the `observability` subpath returns the
active `traceId` and `spanId`; it does not initialize or configure an
OpenTelemetry SDK.

## MySQL options

`createMysqlOptions` validates the common Nacos MySQL structure and always
disables TypeORM schema synchronization and automatic migrations. Connection
parameters are read only from the configured Nacos node. `host`, `port`,
`username`, `password` and `database` are required; optional charset, timezone,
logging, pool and retry settings are validated when present and omitted when
absent.

```ts
import { createMysqlOptions } from '@wlisfes/chat-web-base-schema/database'

createMysqlOptions(configService, {
    configKey: 'database.chat-web-example',
    entities
})
```
