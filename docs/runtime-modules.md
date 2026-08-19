# Shared runtime modules

The runtime modules are exported as isolated subpaths. Importing the package
root does not load Redis, Nacos or database adapters.

## Redis

`RedisModule` owns connection parsing, lifecycle hooks and the common commands
used by authentication sessions. Configuration is read from `REDIS_URL` or the
`REDIS_HOST`, `REDIS_PORT`, `REDIS_DATABASE`, `REDIS_USERNAME`,
`REDIS_PASSWORD` and `REDIS_TLS` values.

```ts
import { RedisModule, RedisService } from '@wlisfes/chat-web-base-schema/redis'
```

## Nacos

Register the shared module once with service-specific defaults. Explicit
environment variables continue to override remote top-level configuration.

```ts
import { NacosModule } from '@wlisfes/chat-web-base-schema/nacos'

NacosModule.forRoot({
    serviceName: 'chat-web-example-service',
    defaultPort: 3020
})
```

`NacosService.loadConfig()` can be awaited by asynchronous database factories
before opening their connections. The service also registers and deregisters
an ephemeral Nacos instance.

## Authentication

The auth subpath exports the HS256 token codec, Redis session lifecycle,
Bearer guard, request principal types and decorators. `SessionAuthModule`
provides the standard downstream-service behavior: verify the account token,
assert that its Redis session is active, and attach the principal.

The account service keeps its own login, captcha, password and user-status
logic. It provides that business authenticator through
`AUTH_TOKEN_AUTHENTICATOR` while reusing the shared guard and token/session
services.

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
