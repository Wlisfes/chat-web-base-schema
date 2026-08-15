# chat-web-base-schema

Shared TypeORM MySQL table definitions for chat-web microservices.

This package only describes existing tables. Databases and tables are created by
external SQL deployment scripts. It does not contain a DataSource or migrations.

## Account MySQL

Import the account table definitions from the account schema subpath:

```ts
import { WindowsAccount } from '@wlisfes/chat-web-base-schema/chat-web-account-mysql';
```

Applications consuming this package must keep TypeORM `synchronize` and
`migrationsRun` disabled.
