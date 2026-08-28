# Deployment changelog

## 2026-08-28 — Explicit Nacos environment mapping

- Affected machines: Company and Home consumers after upgrading; this library does not deploy a container.
- Associated version: unreleased change after `@wlisfes/chat-web-base-schema@1.4.12`.
- Change: removed the implicit `process.env` fallback from `createNacosRuntimeOptions`; consumers must pass one flat object containing service defaults and the complete typed Nacos environment mapping before passing the result to `NacosModule.forRoot()`.
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
