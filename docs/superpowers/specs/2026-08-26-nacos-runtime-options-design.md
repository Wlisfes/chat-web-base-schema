# Explicit Nacos runtime options design

## Context

`NacosRuntimeOptions` currently exposes only `serviceName` and `defaultPort`. `NacosService` independently reads the remaining bootstrap, subscription, authentication, and registration settings from `ConfigService` under `NACOS_*` keys. This makes the actual module contract invisible to TypeScript callers: `NACOS_CONFIG_DATA_ID` and a configuration group are required at runtime, while other values have hidden defaults or conditional behavior.

The shared module should make the complete Nacos contract visible at each `NacosModule.forRoot(options)` call. Nacos bootstrap settings must not be mixed with the remote business configuration that the module loads into `ConfigService`.

## Goals

- Make every Nacos client, subscription, and registration input part of `NacosRuntimeOptions`.
- Express genuinely optional values with optional TypeScript properties and require every other value explicitly.
- Stop `NacosService` from reading `NACOS_*` and `server.port` values from `ConfigService`.
- Keep environment-variable precedence when applying top-level remote business configuration.
- Preserve Nacos configuration loading, subscription, service registration, deregistration, and lifecycle behavior.
- Validate the options at runtime so JavaScript consumers and unchecked external values fail with actionable messages.

## Non-goals

- Add `forRootAsync` or an options factory.
- Change the format of the remote YAML business configuration.
- Release a new package version or update consuming repositories in this change.
- Change Docker, GitHub Actions, runners, deployment directories, ports, external networks, or infrastructure containers.

## Public API

The public options type will be flat so a caller can see the entire contract in one object:

```ts
export interface NacosRuntimeOptions {
    serverAddr: string
    namespace: string
    username?: string
    password?: string
    requestTimeout?: number
    configDataId?: string
    configGroup?: string
    registerEnabled?: boolean
    registerRequired?: boolean
    serviceName: string
    discoveryGroup?: string
    registerIp?: string
    registerPort: number
}
```

Only `serverAddr`, `namespace`, `serviceName`, and `registerPort` are required because they vary by deployment or service and have no safe shared production value. `requestTimeout` defaults to `5000`, `configDataId` to `${serviceName}.yaml`, `configGroup` to `DEFAULT_GROUP`, `registerEnabled` to `true`, `registerRequired` to `false`, and `discoveryGroup` to the resolved configuration group. Authentication and registration IP remain optional.

The existing `defaultPort` property is removed. `registerPort` is the exact port to register and is no longer resolved from `NACOS_REGISTER_PORT`, remote `server.port`, or a library default.

## Runtime behavior

`NacosModule.forRoot(options)` continues to register the supplied options through `NACOS_RUNTIME_OPTIONS`. `NacosService` uses only that injected object for Nacos behavior:

- `serverAddr`, `namespace`, optional credentials, and `requestTimeout` construct the configuration client.
- `configDataId` and `configGroup` identify the configuration to fetch and subscribe to.
- `registerEnabled` controls whether the naming client is created.
- `registerRequired` controls whether a registration failure aborts module initialization.
- `serviceName`, `discoveryGroup`, `registerIp`, and `registerPort` control service registration and deregistration.

`ConfigService` remains injected because remote YAML is applied to it for the rest of the application. `NacosService` will not call `ConfigService.get()` for Nacos bootstrap or registration decisions. Existing environment precedence remains limited to `applyRemoteConfig`: if a top-level remote key is already present in `process.env`, the remote value is not written into `ConfigService`.

## Validation and errors

The service will validate options before creating either Nacos client:

- Required strings must remain non-empty after trimming.
- A provided `requestTimeout` must be a positive integer.
- `registerPort` must be an integer from 1 through 65535.
- Optional credentials and `registerIp` are normalized so blank strings behave as absent values.

Validation errors identify the failing `NacosRuntimeOptions` property rather than referring to a missing environment variable. Registration errors retain their current log-and-continue behavior when `registerRequired` is `false` and are rethrown when it is `true`.

## Compatibility

This is an intentional source-level breaking change to `NacosModule.forRoot`. Existing consumers that supply only `serviceName` and `defaultPort` will fail type checking and must explicitly provide the complete flat options object when they upgrade to the package version that contains this change.

No compatibility fallback to `NACOS_*` is retained inside the shared module because such a fallback would leave the real contract hidden and defeat the purpose of the change.

## Testing

The runtime-module tests will cover the public behavior through the built package:

- Options win even when `ConfigService` contains conflicting `NACOS_*` and `server.port` values.
- Configuration subscription, registration group, service name, IP, and port resolve exclusively from options.
- Defaults are applied when optional options are omitted; invalid provided values are rejected with property-specific errors.
- Environment values still override matching keys from remote YAML.

The repository-level `yarn verify` command remains the completion gate for formatting, type checking, build output, schema validation, and tests.

## Documentation and deployment record

`docs/runtime-modules.md` will show a complete `NacosModule.forRoot` example. Because the change affects the Nacos contract, `deploy/CHANGELOG.md` will record the date, affected Company/Home consumers, unreleased package state, absence of machine-side operations, verification command, and rollback method. A deployment runbook is not introduced because this repository publishes a library and has no service deployment workflow; consuming-service runbooks must be updated when they later adopt the released contract.
