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
