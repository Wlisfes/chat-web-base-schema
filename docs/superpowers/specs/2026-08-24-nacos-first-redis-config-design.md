# Nacos-first Redis configuration design

## Context

On the currently failing Docker Desktop machine, both Account and Finance were restarted with `REDIS_HOST=172.18.0.2`. Redis had moved to `172.18.0.6` after the Docker network was recreated, while `chat-web-redis` correctly resolved to the new address. Account and Finance therefore became unhealthy and Account could not create captcha records.

The configuration path has three related defects:

- Account deployment persists a Docker container IPv4 address in its protected `.env`.
- Account and Finance Compose files inject Redis settings from `.env`, so process environment wins over Nacos.
- `RedisService` constructs its client before `NacosService.loadConfig()` completes. Adding a `redis` node to Nacos alone would not affect the connection.

The other deployment machine is healthy and must not receive an ad-hoc runtime change. Normal releases still follow the Company/Home dual-machine baseline.

## Goals

- Restore Account and Finance on the current machine without changing their current image SHAs.
- Make each service's Nacos Data ID the normal source of Redis host, port, credentials, TLS, timeout, and database index.
- Keep Account on Redis index `0` and Finance on index `1`, including when a URL contains another index.
- Stop persisting Docker container IP addresses.
- Preserve explicit process-environment overrides for controlled emergencies only.
- Keep rollback possible without exposing credentials.

## Non-goals

- Do not change MySQL ownership, credentials, or schemas.
- Do not change Account-owned authentication or Finance's HTTP introspection flow.
- Do not move Docker-only settings such as image, bind address, host port, Compose network, or Nacos bootstrap connectivity into Nacos.
- Do not perform an immediate manual repair on the healthy machine.

## Configuration contract

Each service owns a `redis` node in its existing Nacos Data ID:

```yaml
redis:
  host: chat-web-redis
  port: 6379
  database: 0
  tls: false
  connectTimeoutMs: 5000
```

Finance uses the same shape with `database: 1`. Optional `url`, `username`, and `password` fields remain supported. Real credentials are never written to Git, deployment documentation, or logs.

Field precedence is:

1. An explicitly present `REDIS_*` process environment variable, for emergency override.
2. The current service's Nacos `redis` node.
3. Safe library defaults for optional fields only.

`redis.database` is required in production service configuration. Account validates `0`; Finance validates `1`. A service-specific expected index overrides a database path embedded in `redis.url`, preventing cross-service key access.

The protected deployment `.env` keeps only bootstrap and host concerns: Nacos address/namespace/group/data ID/authentication, Docker network, bind address, host port, timezone, and deployment-only inputs. Redis runtime keys are removed after Nacos migration succeeds.

## Shared runtime changes

`RedisService` will defer URL resolution and client creation until asynchronous module initialization. It will await `NacosService.loadConfig()` before reading Redis settings. The service will read the nested Nacos node while retaining environment-key compatibility.

The shared Redis module will accept the expected database index as service-specific options. Account supplies `0`; Finance supplies `1`. This keeps the reusable connection logic in Schema while leaving data ownership explicit at each service boundary.

Nacos subscriptions may validate later Redis updates, but an already-open Redis client will not silently switch endpoints in this change. A valid configuration update takes effect on controlled service restart; an invalid update is rejected and logged without values.

## Service and deployment changes

Account and Finance will:

- configure the shared Redis module with their expected index;
- stop declaring Redis runtime variables in Compose;
- remove Redis runtime fields from `.env.example` and document their Nacos equivalents;
- migrate their own Nacos Data ID idempotently without reading the other service's configuration;
- update `deploy/CHANGELOG.md` and `deploy/RUNBOOK.md` with validation and rollback commands.

Finance's Nacos bootstrap currently removes `redis`; it will instead preserve and validate Finance's own Redis node. Account will gain equivalent idempotent migration behavior. Neither migration may copy credentials or nodes from another service.

Before starting the new image, deployment stores any existing Redis `.env` entries in a mode-`0600` temporary rollback file, migrates and verifies Nacos, then removes those entries atomically. On failure, rollback restores the protected entries without printing them and starts the previous image. On success, the temporary rollback file is securely removed.

## Current-machine recovery

Before permanent images are available, the failing machine receives a compatibility recovery only:

1. Back up each protected `.env` without displaying its contents.
2. Replace only `REDIS_HOST` with `chat-web-redis`; preserve credentials and indexes.
3. Recreate Account and Finance with their currently running exact SHA images.
4. Verify the new container environments, health endpoints, Account captcha SVG, Gateway routes, and Redis indexes.

This temporary environment override is removed by the permanent Nacos migration. The healthy machine is not manually changed.

## Release sequence

1. Publish a tested Schema version containing asynchronous Nacos-first Redis initialization.
2. Update Account and Finance to that exact package version and add their service-specific Nacos migrations.
3. Build each service image once and deploy the same full Git SHA through the required Company/Home matrix with `fail-fast: false` and isolated `deploy-${server}` concurrency.
4. On each machine, migrate and verify the service's own Nacos Data ID before removing Redis `.env` overrides and starting the new container.
5. Run container health checks, endpoint checks, Redis index checks, and rollback automatically on failure.

The healthy machine changes only through this normal release flow.

## Testing and verification

Schema tests cover:

- Nacos loads before Redis client construction;
- nested Nacos fields are used when environment keys are absent;
- explicit environment keys override Nacos;
- Account index `0` and Finance index `1` override URL paths;
- missing or invalid required indexes fail before connection;
- logs never include hosts, usernames, passwords, or full URLs.

Service/deployment tests cover:

- Compose no longer injects Redis runtime keys;
- Nacos migrations are idempotent and preserve unrelated YAML and credentials;
- Finance migration never imports Account configuration;
- protected `.env` cleanup and rollback preserve mode `0600` and do not print values;
- deployment continues to use one image build and the same full SHA on both machines.

Runtime verification includes:

- Account and Finance containers are healthy;
- Account `/auth/captcha` returns SVG and creates data only in index `0`;
- Finance health succeeds with index `1` and has no Account JWT secret;
- Gateway Account and Finance health routes return business `code=200`;
- restarting the Docker network changes container IPs without breaking either service;
- the healthy machine remains untouched until the normal dual-machine release.

## Rollback

- Compatibility recovery rollback restores the local protected `.env` backup and recreates the same original images.
- Permanent deployment rollback restores the protected Redis environment entries from the temporary file and starts the previous exact SHA image.
- Nacos rollback restores the previous service-local YAML revision; it does not modify the other service's Data ID, database, or Redis data.
- Redis indexes remain `0` for Account and `1` for Finance throughout rollback.
