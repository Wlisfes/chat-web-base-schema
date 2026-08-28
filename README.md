# chat-web-base-schema

Shared TypeORM MySQL table definitions, DTO validation metadata, Swagger
descriptions and opt-in NestJS runtime modules for chat-web microservices.

This package only describes existing tables. Databases and tables are created by
external SQL deployment scripts. It does not contain a DataSource or migrations.

## Account MySQL

Import the account table definitions from the account schema subpath:

```ts
import { TbAccountConsumer, TbAccountUser, TbAccountUserDto } from '@wlisfes/chat-web-base-schema/chat-web-account-mysql'
```

Applications consuming this package must keep TypeORM `synchronize` and
`migrationsRun` disabled.

Internal users and external customers are both owned by the account schema.
Finance only owns brands, currencies, exchange rates, countries and pricing;
it must reference customers through the account service instead of defining a
second customer table.

Each table module has a canonical create script with the same filename under
its service's `sql` directory. Later changes are stored as immutable scripts in
`sql/changes` and executed by the external SQL deployment process.

Run all package checks before publishing:

```bash
yarn verify
```

See [Schema conventions](docs/schema-conventions.md) before adding another table.

## Shared runtime modules

Infrastructure code is exposed through isolated package subpaths so consumers
only load the dependencies they use:

- `@wlisfes/chat-web-base-schema/redis`
- `@wlisfes/chat-web-base-schema/nacos`
- `@wlisfes/chat-web-base-schema/auth`
- `@wlisfes/chat-web-base-schema/database`
- `@wlisfes/chat-web-base-schema/logging`
- `@wlisfes/chat-web-base-schema/observability`

See [Shared runtime modules](docs/runtime-modules.md) for registration and
extension examples. Business authentication, permissions, database entities
and gateway routing remain in their owning services.

## Shared HTTP response handling

All NestJS services should register the shared response interceptor and the
filter matching their transport. See [统一响应与异常处理](docs/http-response.md)
for the response contract and registration examples.

## Shared service utilities

Services import reusable pagination DTOs, tree validation/building, UID helpers
and HTTP request context middleware from the existing utility subpath:

```ts
import { PageDto, buildTree, generateUid } from '@wlisfes/chat-web-base-schema/utils'
import { requestContextMiddleware } from '@wlisfes/chat-web-base-schema/request-context'
import { ReadableConsoleLogger, createRequestLoggingMiddleware } from '@wlisfes/chat-web-base-schema/logging'
```

These helpers must not be copied into a service-level `src/common` directory.

HTTP 服务统一将 `ReadableConsoleLogger` 传给 `NestFactory.create`。它在本地保留
带缩进的彩色请求 JSON，在 `NODE_ENV=production` 时输出适合 Dozzle 的单行彩色
请求 JSON。`createRequestLoggingMiddleware` 只接收服务名称，并默认过滤健康检查、
浏览器探测、favicon 和接口文档等无业务价值路径。请求上下文仍会通过共享 Feign
客户端自动转发 `x-request-id`，请求日志统一以 `logId` 展示该值。
