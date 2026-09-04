/**
 * Feign 服务端实现的最小委托基类。
 *
 * 共享客户端同时承担“调用端代理”和“服务端路由声明”两种职责。服务端 Controller
 * 继承客户端后只需在构造函数中传入真实实现，继承的方法会自动保留共享路由元数据，
 * 从而不再重复声明 Nest 路由装饰器或复制接口签名。
 */
export abstract class FeignWebClient<TImplementation extends object> {
    private readonly implementation?: TImplementation

    protected constructor(implementation?: TImplementation) {
        this.implementation = implementation
    }

    /** 将共享客户端方法转发给服务端业务实现；调用端代理不会执行此方法。 */
    protected dispatch<TMethod extends keyof TImplementation>(
        method: TMethod,
        ...args: TImplementation[TMethod] extends (...parameters: infer TParameters) => unknown ? TParameters : never
    ): TImplementation[TMethod] extends (...parameters: any[]) => infer TResult ? TResult : never {
        if (!this.implementation) throw new Error(`${this.constructor.name} 必须由 FeignModule 注入或提供服务实现`)
        const handler = this.implementation[method]
        if (typeof handler !== 'function') throw new Error(`Feign 服务实现缺少 ${String(method)} 方法`)
        return handler.apply(this.implementation, args) as TImplementation[TMethod] extends (...parameters: any[]) => infer TResult
            ? TResult
            : never
    }
}
