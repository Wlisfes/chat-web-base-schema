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

Register the shared module once with the service's intrinsic name and port.

```ts
import { NacosModule } from '@wlisfes/chat-web-base-schema/nacos'

NacosModule.forRoot({ serviceName: 'chat-web-example-service', registerPort: 3020 })
```

`NacosModule.forRoot` 内部统一读取和校验扁平化 `NACOS_*` 环境变量，避免每个服务重复实现字符串、布尔值和端口转换。调用前先执行 `ConfigModule.forRoot`，确保本地 `.env` 已加载。`NACOS_SERVER` 与 `NACOS_NAMESPACE` 必填；未显式配置注册端口时还会读取 `PORT`。其余环境变量与下方可选字段一一对应。

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
    defaultBaseUrl: 'http://chat-web-account-service:3000'
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

## Structured logging and trace correlation

Use the shared logger during Nest application creation. It emits one JSON
object per line and adds the active request and OpenTelemetry trace context to
framework, business and exception logs.

```ts
import { createStructuredLogger } from '@wlisfes/chat-web-base-schema/logging'

const logger = createStructuredLogger({ serviceName: 'chat-web-example-service' })
const app = await NestFactory.create(AppModule, { logger })
```

Register `requestContextMiddleware` before `createRequestLoggingMiddleware`.
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
