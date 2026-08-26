# Deployment changelog

## 2026-08-26 — Unreleased explicit Nacos runtime options

- Affected machines: Company and Home consumers after they explicitly upgrade to the future package release.
- Associated version: unreleased change after `@wlisfes/chat-web-base-schema@1.4.6`; this change does not publish or bump a version.
- Change: `NacosModule.forRoot()` now receives the complete flat bootstrap, subscription and registration contract. Only `serverAddr`, `namespace`, `serviceName` and `registerPort` are required; subscription groups, Data ID, timeouts and registration behavior have documented defaults. Every exported option includes IDE-visible JSDoc for its purpose and default. The shared runtime no longer reads `NACOS_*` or `server.port` from `ConfigService`.
- Machine-side operations: none in this library repository. Consumer services must update their module call sites before upgrading and continue to deploy the same complete Git SHA image to Company and Home.
- Verification: run `yarn verify` in this repository. For each future consumer migration, run that repository's verification command and its post-deployment health endpoint checks on both machines.
- Rollback: before a package release, revert the Nacos runtime commit. After adoption, pin consumers to the previous known-good package version and redeploy each consumer's previous complete Git SHA to both machines.
