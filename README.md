# chat-web-base-schema

Shared TypeORM entities and MySQL migrations for chat-web microservices.

## Account MySQL

The first schema module exports `AccountUserEntity` and `accountMysqlEntities`:

```ts
import {
  AccountUserEntity,
  accountMysqlEntities,
} from '@wlisfes/chat-web-base-schema/chat-web-account-mysql';
```

Copy `.env.example` to `.env`, create the configured database, and run:

```bash
yarn migration:show:account
yarn migration:run:account
```

Production services must keep TypeORM `synchronize` and `migrationsRun` disabled.
