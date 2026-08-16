# Schema conventions

Every table definition must follow these rules.

## Responsibilities

- This package describes existing MySQL tables and exports TypeORM entities,
  complete field DTOs, validation metadata and Swagger metadata.
- External SQL creates and changes tables. TypeORM `synchronize` and
  `migrationsRun` must remain disabled in consuming services.
- SQL columns, indexes and comments must match the metadata in this package.

## SQL layout

Each service schema keeps table modules and SQL together:

```text
service-name/
├── modules/
│   └── table_name.ts
└── sql/
    ├── table_name.sql
    └── changes/
        └── YYYYMMDDHHmmss__table_name__action.sql
```

- Every module has a canonical create SQL file with the same basename.
- Every later table change adds an immutable timestamped SQL file under
  `sql/changes` and updates the canonical create SQL in the same commit.
- Applied change files are never edited or deleted.
- The external deployment system records and executes pending change files.
- MySQL DDL can auto-commit; every change must be tested before deployment.

## Required exports

Each table module exports:

1. A database-column enum, for example `TbAccountUserColumn`.
2. Business value enums and `defineEnumMetadata()` definitions.
3. A complete field DTO, for example `TbAccountUserDto`.
4. A PascalCase TypeORM entity, for example `TbAccountUser`.

## Entity rules

- Entity class names use PascalCase; table and file names use snake_case.
- Every `@Column` explicitly declares `name`, `type`, `length` or `precision`,
  `nullable`, and `comment` where applicable.
- Properties use camelCase. Database names come from the column enum.
- Nullable database fields do not use `| null` in TypeScript in this project.
- Indexes are described with named `@Index` decorators and duplicated in the
  external SQL.
- String enums are stored in `varchar`, not native MySQL `enum`, so values can
  evolve without rebuilding the column type.
- Cross-service relations store IDs only. Do not add TypeORM relations to an
  entity owned by another microservice.

## DTO and Swagger rules

- A complete table DTO contains every Entity property.
- DTOs extend `DataBaseDto` or `DataBaseByDto` for common fields.
- Database-generated fields are Swagger `readOnly` and have no input validators.
- Writable fields include `ApiProperty` descriptions/examples and validators
  with Chinese error messages.
- Optional fields use `required: false` and `IsOptional()`.
- Endpoint DTOs derive from the complete DTO with `PickType`, `OmitType` and
  `PartialType`, then add endpoint-specific business rules.

## Enum rules

Use `defineEnumMetadata()` to generate `metadata`, `values`, `options`, `count`
and `comment`. Reuse the generated comment in Swagger and `@Column` metadata.
External SQL must copy the same comment.

## Date rules

- Date columns use MySQL `datetime(3)` unless the database design says otherwise.
- Date columns use `DateWithColumn`, which passes write values through unchanged
  and formats read values as `YYYY-MM-DD HH:mm:ss` by default.
- A different output format can be supplied through the `format` option.
- Database-generated date fields are Swagger `readOnly` and do not have input
  validators.

## Verification

Run `yarn verify`. The schema consistency check requires the Entity database
columns, column enum and Swagger DTO properties to contain the same fields.
