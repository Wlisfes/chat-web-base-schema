# Repository instructions

本文件在本仓库内独立生效，不依赖 `F:/chat-web-service/AGENTS.md` 或其他工作区文件。

## 通用工程规则

- 使用 Node.js 22、Yarn 1.22.22 和 TypeScript；源码使用 UTF-8，Shell、YAML 和 SQL 文件使用 LF。
- 统一使用 4 空格、无分号、单引号、`printWidth: 140`、无尾随逗号；内部源码统一使用 `@/*` 路径别名。
- 文件名使用小写 kebab-case 和职责后缀；类、接口、枚举使用 PascalCase，变量、函数使用 camelCase，常量使用 UPPER_SNAKE_CASE。
- 日志、校验消息、Swagger 描述和面向维护者的错误信息使用中文，代码标识符使用英文。
- 本仓库只提供共享 Entity、DTO、元数据和 SQL，不连接业务数据库；消费服务的 TypeORM 必须保持 `synchronize: false` 和 `migrationsRun: false`。
- 跨服务数据只能通过强类型服务 API 访问，禁止复制 Entity、执行跨库 SQL 或在业务服务中重建共享表定义。
- 每次改动至少执行格式检查、TypeScript 类型检查、构建和 Schema 一致性验证；已应用的增量 SQL 不得修改或删除。

## Scope and responsibility

- This repository is the source of truth for shared TypeORM MySQL table definitions, complete field DTOs, validation metadata, Swagger metadata, and SQL files.
- It does not connect to MySQL or execute SQL. External deployment tooling creates and changes databases.
- Before changing a schema, read `docs/schema-conventions.md` and preserve its rules.

## Service schema layout

- Every directory directly under `src/schema/` represents one microservice database schema.
- Every table has a TypeScript module at `modules/table_name.ts` and a canonical create script at `sql/table_name.sql`.
- Later changes require an immutable `sql/changes/YYYYMMDDHHmmss__table_name__action.sql` file and an update to the canonical create script in the same change.
- Never edit or delete an incremental SQL file after it has been applied to a shared environment.
- Schemas from different service directories are strict data boundaries. Shared entities and SQL may only be consumed by the owning service; cross-service reads and writes use typed service APIs instead of cross-database SQL.

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
- 公共分页请求统一使用 `PageDto` 的 `page`、`size` 字段（默认 1/50，`size` 最大 100），分页响应统一为 `page`、`size`、`total`、`list`；不得新增 `pageSize`、`items`、`records` 或 `rows` 同义字段。
- Keep implementation functions in the relevant utility module; do not move implementations into `src/types.ts`.
- Internal source imports may use the `@/*` alias. The build must continue rewriting aliases for published output.
- `DateWithColumn` must preserve write values and format database read values as `YYYY-MM-DD HH:mm:ss` by default.
- Reusable Redis, Nacos, authentication, database configuration and grant-validation behavior belongs in the runtime modules here. Runtime helpers must preserve per-service Redis indexes and reject MySQL grants outside the owning database.
- 运行时只允许从 `.env` 读取 `NODE_ENV`、`PORT` 和 Nacos 连接/订阅参数；MySQL、Redis、JWT、Feign、路由与超时等业务配置只从 Nacos 读取，缺少必需字段时直接抛出异常，不提供旧环境变量兼容或静默默认值。

## NestJS 模块编码基准

- `chat-web-account-service/src/modules/sheet/` 是各消费服务 Controller、Service、DTO、Utils Service 和 Module 的结构基准；菜单模块使用 `sheet` 命名，数据库实体仍保留 `TbAccountMenu` 等持久化名称。本共享包不得承载具体业务 Controller、业务路由或业务编排。
- 共享 Service 和工具类不得依赖 Express `Request`、`Response`、Cookie 或响应发送逻辑；公开方法使用明确参数、显式返回类型和中文职责注释，由消费服务的薄 Controller 原样调用。
- 请求和响应 DTO 必须提供完整类型、Swagger 示例/中文说明、必要的类型转换及中文校验消息；分页统一复用 `PageDto` 和 `PageResult<T>`。
- Entity 查询工具统一优先使用 `DataBaseService.builder()`，QueryBuilder 别名固定为 `t`；事务工具必须保持同一个 `EntityManager` 或 `QueryRunner` 的连接与事务边界。
- 只有可复用的查找、校验、锁、树结构或转换形成独立职责时才创建 Utils Service；仅调用一次且没有复用价值的简单步骤不得机械拆分。
- Module 按 `imports`、`controllers`、`providers`、`exports` 组织；新增共享能力应导出最小接口，不得把消费服务的业务模块复制进本包。

## Verification

- Run `yarn verify` after every schema or configuration change.
- A change is incomplete if formatting, type checking, building, schema consistency, module/SQL pairing, SQL columns, SQL indexes, or enum comments fail validation.
- Do not publish an already-existing npm version. Version changes and releases require explicit user direction.

## 共享包发布后的跨仓库联动

- 用户已经要求完成共享包联动时，合并 `chat-web-base-schema` 后必须由 Agent 自行跟踪 GitHub Actions，等待新版本发布完成，不得把等待发布、更新依赖、提交或合并步骤转交给用户。
- 新版本可用后，只升级用户明确点名的消费服务。不得修改、提交、推送或为未点名服务创建 PR；确需扩大联动范围时必须先获得用户明确同意。
- 对用户点名的消费服务，升级到明确的新版本，移除已经由共享包提供的重复实现，并完成该仓库规定的构建、测试和部署变更记录。
- 验证通过后，Agent 应自行提交、推送、创建 PR 并合并到默认分支；只有权限、认证、分支保护或持续失败的 CI 确实阻止自动完成时，才向用户报告阻塞。
- 禁止在包尚未发布时提前提交一个无法安装或无法构建的依赖版本。

## 分支生命周期

- 远程仓库只保留 `main`、`developer` 两个长期分支；临时需求分支必须先合并到 `developer`，发布时同步合并到 `main`，合并并验证通过后立即删除远程和本地临时分支。

## Git 提交规范

- 所有提交信息必须使用 Conventional Commits 类型前缀，格式固定为 `<type>: 中文摘要`；如需填写作用域，使用 `<type>(<scope>): 中文摘要`。
- `type` 只能使用以下类型：`init`（项目初始化）、`feat`（添加新特性）、`fix`（修复缺陷）、`docs`（仅修改文档）、`style`（仅调整格式或样式）、`refactor`（代码重构）、`perf`（性能优化）、`test`（增加或调整测试）、`build`（构建或依赖变更）、`ci`（持续集成或部署配置）、`chore`（工程工具或其他维护性变更）。
- 提交摘要、正文和脚注必须使用中文；类型前缀保留上述英文小写关键字，代码标识符、命令和版本号可按实际需要保留原文。
- 每个提交应聚焦单一目的，摘要使用动词开头并准确说明影响范围，禁止使用 `update`、`modify` 等无意义描述或整句英文提交信息。
- 示例：`feat: 新增客户归属人筛选`、`fix: 修复 Nacos 服务注册失败`、`docs: 补充部署回滚说明`。
