# Deployment changelog

## 2026-09-02 — 统一财务汇率日期列名

- Affected consumers: Finance after upgrading to the shared package release containing this schema change; this library deploys no container.
- Change: renamed the physical `tb_finance_currency_exchange.rate_date` column to `date` in the canonical SQL and added the immutable migration `20260902090000__tb_finance_currency_exchange__rename_rate_date_to_date.sql`. The TypeORM property `rateDate` remains as the compatibility-facing camelCase field.
- Machine-side operations: publish the tested package, upgrade Finance, and let its schema applicator run the new migration before restarting the service. Do not edit the already-applied `20260818193000__tb_finance_schema__create.sql` file.
- Verification: run `yarn verify` here, then Finance build/tests and a schema check confirming the `date` column, unique key and lookup index.
- Rollback: pin Finance to the previous image only before applying this migration; after applying it, restore the column with a separately reviewed SQL change rather than relying on an image rollback.

## 2026-08-31 — Nacos-first Redis runtime configuration

- Affected consumers: CRM and Finance after upgrading to `@wlisfes/chat-web-base-schema@1.4.19`; the library itself deploys no container.
- Change: added `RedisModule.forRoot({ database })` with injected service-isolated Redis index; `RedisService` now waits for Nacos configuration and reads the nested `redis` node (`host`, `port`, `database`, `tls`, `connectTimeoutMs`, and optional credentials/URL). Legacy `REDIS_*` keys remain emergency overrides.
- Machine-side operations: publish the package, then update only the explicitly selected consumers and their service-local Nacos Data IDs. Do not copy Redis credentials into repository files or deployment logs.
- Verification: run `yarn verify`; upgraded consumers must run their repository build, tests and Redis index checks.
- Rollback: pin consumers to the previous released package and restore the prior service images; Nacos data and Redis contents are not rolled back.

## 2026-08-30 — 统一 Nacos 服务发现运行时

- Affected machines: Gateway after it upgrades to the released shared package; this library does not deploy a container.
- Associated version: unreleased change after `@wlisfes/chat-web-base-schema@1.4.16` (the release workflow will assign the next available patch version).
- Change: moved the shared Nacos naming client, discovery subscription lifecycle, health status, fallback resolution and smooth weighted selection into `NacosService`. Gateway no longer needs a second Nacos client implementation.
- Change: hardened shared Nacos subscription and shutdown lifecycle; concurrent discovery lookups are de-duplicated, externally registered listeners are cleaned up, and both `_close()` (the Node SDK API) and `close()` wrappers are supported.
- Machine-side operations: none until this package is published and Gateway explicitly upgrades to the new version. Existing Nacos Data IDs, groups, namespaces, routes and service registration values remain unchanged.
- Verification: run `yarn verify`; after the package is available, run Gateway format/type/build/tests and verify `/health/ready` plus each configured `/api/{service}` route.
- Rollback: keep Gateway on the previous complete Git SHA and `@wlisfes/chat-web-base-schema@1.4.16`; no Nacos data or business database rollback is required.

## 2026-08-30 — Nacos 注册实例权重

- Affected machines: explicitly upgraded consumer services; this library does not deploy a container.
- Associated version: unreleased change after `@wlisfes/chat-web-base-schema@1.4.15`.
- Change: added optional `registerWeight` to the shared Nacos runtime contract. `forRootNacosRuntimeOptions()` reads `NACOS_REGISTER_WEIGHT` as a positive finite number and the registration and deregistration requests carry the configured weight; the default remains `1`.
- Machine-side operations: none before the package is published and explicitly selected consumers upgrade. Local services may set `NACOS_REGISTER_WEIGHT=10` in their uncommitted `.env` when the new package version is available.
- Verification: run `yarn verify`; upgraded consumers must run their repository build and tests.
- Rollback: keep consumers on the previous package version and restore the previous complete Git SHA.

## 2026-08-29 — Simplified Nacos module bootstrap

- Affected machines: explicitly upgraded consumer services; this library does not deploy a container.
- Associated version: unreleased change after `@wlisfes/chat-web-base-schema@1.4.15`.
- Change: renamed `createNacosRuntimeOptions` to `forRootNacosRuntimeOptions` and changed it to accept `process.env` directly. The adapter now derives `serviceName` from `NACOS_SERVICE_NAME` and the default registration port from `PORT`, removing repetitive field-by-field mapping at each module call site.
- Machine-side operations: none before the shared package is published and the explicitly selected consumers upgrade. Existing Nacos values and service ports are unchanged.
- Verification: run `yarn verify`; upgraded consumers must run their repository build and tests.
- Rollback: keep consumers on `@wlisfes/chat-web-base-schema@1.4.15` and restore the previous `createNacosRuntimeOptions` call sites.

## 2026-08-28 — Unambiguous Nacos registration port mapping

- Affected machines: Company and Home consumers after upgrading; this library does not deploy a container.
- Associated version: unreleased change after `@wlisfes/chat-web-base-schema@1.4.13`.
- Change: removed the duplicate `PORT` property from `NacosRuntimeOptionsInput`. Consumers now pass `process.env.PORT` through `registerPort`; the optional `NACOS_REGISTER_PORT` remains an explicit registration-only override.
- Machine-side operations: none. Existing consumer `.env` files continue to define `PORT`, `NACOS_SERVER` and `NACOS_NAMESPACE`.
- Verification: run `yarn verify`; upgraded consumers must run their repository verification and post-deployment health checks.
- Rollback: pin consumers to `@wlisfes/chat-web-base-schema@1.4.13` and redeploy the previous complete Git SHA.

## 2026-08-28 — Explicit Nacos environment mapping

- Affected machines: Company and Home consumers after upgrading; this library does not deploy a container.
- Associated version: unreleased change after `@wlisfes/chat-web-base-schema@1.4.12`.
- Change: removed the implicit `process.env` fallback from `createNacosRuntimeOptions`; consumers pass one flat typed object before passing the result to `NacosModule.forRoot()`. Only `NACOS_SERVER` and `NACOS_NAMESPACE` are mandatory environment mappings; all other environment fields remain optional.
- Machine-side operations: none before consumers upgrade. Keep each service's required Nacos connection values in its machine-specific `.env`.
- Verification: run `yarn verify`; upgraded consumers must run their repository verification and post-deployment health checks on both machines.
- Rollback: pin consumers to `@wlisfes/chat-web-base-schema@1.4.12` and redeploy each machine's previous complete Git SHA.

## 2026-08-26 — Shared Nacos environment adapter

- Affected machines: Company and Home consumers after upgrading; this library does not deploy a container.
- Associated version: the exact `@wlisfes/chat-web-base-schema` version produced by this release.
- Change: added and exported `createNacosRuntimeOptions` to convert flattened `NACOS_*` environment variables into the complete typed runtime contract. Only the server and namespace lack defaults; each consumer supplies its intrinsic service name and registration port, while optional values retain shared defaults.
- Machine-side operations: verify that every consumer `.env` explicitly contains the machine-specific `NACOS_SERVER` and `NACOS_NAMESPACE`. No database, Redis, Runner, deploy-directory, port or external-network changes are required.
- Verification: run `yarn verify`; consumers run their repository tests and Compose validation with a placeholder `IMAGE`, then verify the registered instance after deployment.
- Rollback: redeploy each consumer's previous complete Git SHA pinned to its prior exact package version. Nacos data and infrastructure containers do not need rollback.

## 2026-08-26 — Unreleased explicit Nacos runtime options

- Affected machines: Company and Home consumers after they explicitly upgrade to the future package release.
- Associated version: unreleased change after `@wlisfes/chat-web-base-schema@1.4.6`; this change does not publish or bump a version.
- Change: `NacosModule.forRoot()` now receives the complete flat bootstrap, subscription and registration contract. Only `serverAddr`, `namespace`, `serviceName` and `registerPort` are required; subscription groups, Data ID, timeouts and registration behavior have documented defaults. Every exported option includes IDE-visible JSDoc for its purpose and default. The shared runtime no longer reads `NACOS_*` or `server.port` from `ConfigService`.
- Machine-side operations: none in this library repository. Consumer services must update their module call sites before upgrading and continue to deploy the same complete Git SHA image to Company and Home.
- Verification: run `yarn verify` in this repository. For each future consumer migration, run that repository's verification command and its post-deployment health endpoint checks on both machines.
- Rollback: before a package release, revert the Nacos runtime commit. After adoption, pin consumers to the previous known-good package version and redeploy each consumer's previous complete Git SHA to both machines.
