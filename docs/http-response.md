# 统一响应与异常处理

`TransformInterceptor`、`HttpExceptionFilter` 和 `RpcExceptionFilter` 供所有 Chat Web NestJS 服务复用。

## 响应契约

HTTP 成功和异常响应都使用相同的四个字段：

```json
{
    "data": null,
    "code": 200,
    "message": "success",
    "timestamp": "2026-08-18 12:00:00"
}
```

- 成功时 `code` 为 `200`，异常时为实际业务状态码。
- HTTP JSON 业务异常默认使用传输状态 `200`，前端只通过响应体 `code` 判断业务结果，避免 Axios 将业务异常转入网络错误分支。
- `data` 只在值为 `null` 或 `undefined` 时转换为 `null`，`false`、`0` 和空字符串会原样保留。
- 显式设置 `Content-Type` 的 SVG、文件流等响应不会被包装。
- 已符合统一结构的响应不会被重复包装。
- 未处理的 500 异常只向客户端返回“服务器内部错误”，详细堆栈仅写入服务日志。

## HTTP 服务接入

```ts
import { Module } from '@nestjs/common'
import { HttpResponseModule } from '@wlisfes/chat-web-base-schema'

@Module({
    imports: [HttpResponseModule]
})
export class AppModule {}
```

每个 HTTP 应用只导入一次 `HttpResponseModule`。需要自定义注册顺序时，也可以分别使用导出的 `TransformInterceptor` 和
`HttpExceptionFilter`。

Docker 健康检查、Webhook 等依赖原生 HTTP 状态的协议型接口使用 `@PreserveHttpStatus()`：

```ts
@Get('health')
@PreserveHttpStatus()
health() {
    // 这里抛出的 503 仍以 HTTP 503 返回，响应体继续使用统一结构。
}
```

## RPC 服务接入

RPC handler 的成功数据保持原样，在 HTTP 网关层统一包装；RPC 服务只注册异常过滤器：

```ts
microservice.useGlobalFilters(new RpcExceptionFilter())
```

同一个混合应用应在对应的 HTTP application 与 microservice 实例上分别注册过滤器，避免两个 catch-all 过滤器竞争处理同一上下文。
