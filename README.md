# chat-web-base-schema

Shared TypeORM MySQL table definitions, DTO validation metadata, Swagger
descriptions and opt-in NestJS runtime modules for chat-web microservices.

This package only describes existing tables. Databases and tables are created by
external SQL deployment scripts. It does not contain a DataSource or migrations.

## Account MySQL

Import the account table definitions from the account schema subpath:

```ts
import { TbAccountUser, TbAccountUserDto, TbAccountUserStatusOptions } from '@wlisfes/chat-web-base-schema/chat-web-account-mysql'
```

Applications consuming this package must keep TypeORM `synchronize` and
`migrationsRun` disabled.

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

See [Shared runtime modules](docs/runtime-modules.md) for registration and
extension examples. Business authentication, permissions, database entities
and gateway routing remain in their owning services.

## Shared HTTP response handling

All NestJS services should register the shared response interceptor and the
filter matching their transport. See [统一响应与异常处理](docs/http-response.md)
for the response contract and registration examples.
