# Repository instructions

## Scope and responsibility

- This repository is the source of truth for shared TypeORM MySQL table definitions, complete field DTOs, validation metadata, Swagger metadata, and SQL files.
- It does not connect to MySQL or execute SQL. External deployment tooling creates and changes databases.
- Before changing a schema, read `docs/schema-conventions.md` and preserve its rules.

## Service schema layout

- Every directory directly under `src/schema/` represents one microservice database schema.
- Every table has a TypeScript module at `modules/table_name.ts` and a canonical create script at `sql/table_name.sql`.
- Later changes require an immutable `sql/changes/YYYYMMDDHHmmss__table_name__action.sql` file and an update to the canonical create script in the same change.
- Never edit or delete an incremental SQL file after it has been applied to a shared environment.

## Required table contract

- Export a database-column enum, business value enums, metadata definitions created with `defineEnumMetadata`, a complete field DTO, and a PascalCase TypeORM Entity.
- Entity properties use camelCase; MySQL tables, columns, files, and SQL use snake_case.
- Every `@Column` explicitly declares its database name, type, length or precision, nullable state, and Chinese comment where applicable.
- Mirror every named `@Index` in the canonical and incremental SQL.
- String business enums use `varchar`. Reuse the generated enum comment in Swagger, TypeORM, and SQL.
- Nullable database fields do not use `| null` in TypeScript in this repository.

## DTO, validation, and Swagger

- Complete table DTO fields must match Entity fields exactly and extend `DataBaseDto` or `DataBaseByDto` for common fields.
- Database-generated fields are Swagger `readOnly` and do not have input validators.
- Writable fields have `ApiProperty` descriptions/examples and `class-validator` rules with Chinese messages.
- Optional fields use `required: false` and `IsOptional()`.
- Endpoint-specific DTOs are derived with mapped types and add their own business rules; do not silently change table DTO semantics to suit one endpoint.

## Shared code placement

- Put exported reusable TypeScript types in `src/types.ts`.
- Keep implementation functions in the relevant utility module; do not move implementations into `src/types.ts`.
- Internal source imports may use the `@/*` alias. The build must continue rewriting aliases for published output.
- `DateWithColumn` must preserve write values and format database read values as `YYYY-MM-DD HH:mm:ss` by default.

## Verification

- Run `yarn verify` after every schema or configuration change.
- A change is incomplete if formatting, type checking, building, schema consistency, module/SQL pairing, SQL columns, SQL indexes, or enum comments fail validation.
- Do not publish an already-existing npm version. Version changes and releases require explicit user direction.

## 共享包发布后的跨仓库联动

- 用户已经要求完成共享包联动时，合并 `chat-web-base-schema` 后必须由 Agent 自行跟踪 GitHub Actions，等待新版本发布完成，不得把等待发布、更新依赖、提交或合并步骤转交给用户。
- 新版本可用后，Agent 必须检查同一工作区中的所有消费服务，升级到明确的新版本，移除已经由共享包提供的重复实现，并完成各仓库规定的构建、测试和部署变更记录。
- 验证通过后，Agent 应自行提交、推送、创建 PR 并合并到默认分支；只有权限、认证、分支保护或持续失败的 CI 确实阻止自动完成时，才向用户报告阻塞。
- 禁止在包尚未发布时提前提交一个无法安装或无法构建的依赖版本。
