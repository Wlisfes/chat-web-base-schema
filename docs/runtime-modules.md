# Shared runtime modules

The runtime modules are exported as isolated subpaths. Importing the package
root does not load Redis, Nacos or database adapters.

## Redis

`RedisModule` owns connection parsing, lifecycle hooks and the common commands
used by authentication sessions. Configuration is read from `REDIS_URL` or the
`REDIS_HOST`, `REDIS_PORT`, `REDIS_DATABASE`, `REDIS_USERNAME`,
`REDIS_PASSWORD` and `REDIS_TLS` values. Client creation is deferred until
application bootstrap, after `NacosService` has loaded remote configuration,
so these keys can live in the service's Nacos Data ID instead of root `.env`.

```ts
import { RedisModule, RedisService } from '@wlisfes/chat-web-base-schema/redis'
```

## Nacos

Pass `process.env` directly to the environment adapter, then register the
shared module with the complete runtime options.

```ts
import 'dotenv/config'
import { forRootNacosRuntimeOptions, NacosModule } from '@wlisfes/chat-web-base-schema/nacos'

NacosModule.forRoot(forRootNacosRuntimeOptions(process.env))
```

`forRootNacosRuntimeOptions` 负责从 `process.env` 转换和校验 Nacos 启动参数。`PORT`、`NACOS_SERVICE_NAME`、`NACOS_SERVER` 与 `NACOS_NAMESPACE` 必填，其余字段均可省略并使用共享默认值。由于 `AppModule` 装饰器会在 `ConfigModule.forRoot()` 初始化前执行，入口文件应先加载 `dotenv/config`；容器环境则直接使用注入的环境变量。`NACOS_REGISTER_PORT` 仍可作为特殊场景的显式覆盖，但通常直接使用 `PORT`。

`NacosService` reads every Nacos client, subscription and registration value
from this options object. It does not resolve `NACOS_*` or `server.port`
through `ConfigService`. Optional overrides and their defaults are:

- `requestTimeout`: `5000` milliseconds.
- `configDataId`: `${serviceName}.yaml`.
- `configGroup`: `DEFAULT_GROUP`.
- `registerEnabled`: `true`.
- `registerRequired`: `false`.
- `discoveryGroup`: the resolved `configGroup`.
- `username`, `password`: omitted.
- `registerIp`: the first non-internal IPv4 interface, falling back to `127.0.0.1`.

`NacosService.loadConfig()` can be awaited by asynchronous database factories
before opening their connections. The service also registers and deregisters
an ephemeral Nacos instance. Explicit process environment values continue to
override matching top-level keys from remote business configuration.

## Authentication

The auth subpath exports the HS256 token codec, Redis session lifecycle,
Bearer guard, request principal types and decorators.

The account service keeps its own login, captcha, password and user-status
logic. It provides that business authenticator through
`AUTH_TOKEN_AUTHENTICATOR` while reusing the shared guard and token/session
services.

Business services must not read the account Redis database or hold the account
JWT secret. Import `AccountRemoteAuthModule` to validate Bearer tokens through
the account service `/auth/token/introspect` endpoint and attach the returned
principal to the request.

```ts
import { AccountRemoteAuthModule, JwtAuthGuard } from '@wlisfes/chat-web-base-schema/auth'

@Module({
    imports: [AccountRemoteAuthModule],
    providers: [{ provide: APP_GUARD, useExisting: JwtAuthGuard }]
})
export class AppModule {}
```

The remote client reads `ACCOUNT_SERVICE_URL` and the optional
`ACCOUNT_AUTH_TIMEOUT_MS` value. `SessionAuthModule` is only for an owning
service that is explicitly allowed to verify JWTs and access its own session
store; it is not the downstream business-service default.

## Declarative Feign clients

Cross-service HTTP calls use the shared declarative Feign runtime. A client class only declares the service address, request method, path and parameter bindings; `FeignModule` supplies the HTTP proxy implementation and consistently handles timeouts, Bearer headers, response envelopes and upstream errors.

```ts
@FeignClient({
    name: '账号服务',
    baseUrlConfigKey: 'ACCOUNT_SERVICE_URL',
    defaultBaseUrl: 'http://chat-web-account-service:5010'
})
export class AccountFeignClient {
    @FeignGet('/consumer/resolver')
    resolveConsumer(@FeignHeader('authorization') authorization: string, @FeignQuery('keyId') keyId: number): Promise<AccountConsumer> {
        throw new Error('AccountFeignClient must be injected by FeignModule')
    }
}

@Module({
    imports: [FeignModule.register([AccountFeignClient])]
})
export class IntegrationModule {}
```

Use `@FeignGet` with query parameters and `@FeignPost` with one `@FeignBody`. Multi-select fields remain arrays in the POST body. Business services must not create their own `fetch`, Axios or cross-database implementation for an endpoint already declared by a shared Feign client.

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

`createMysqlOptions` validates the common Nacos MySQL structure, applies an
explicit allowlist of environment overrides and always disables TypeORM schema
synchronization and automatic migrations.

```ts
import { createMysqlOptions } from '@wlisfes/chat-web-base-schema/database'

createMysqlOptions(configService, {
    configKey: 'database.chat-web-example',
    entities,
    environmentPrefix: 'EXAMPLE_MYSQL',
    environmentOverrides: ['host', 'port', 'database']
})
```
