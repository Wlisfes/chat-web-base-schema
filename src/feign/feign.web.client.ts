import { Inject, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { timingSafeEqual } from 'node:crypto'
import { getFeignClientOptions } from './feign.decorator'
import type * as FeignTypes from './feign.interface'

/**
 * Feign 服务端实现的最小委托基类。
 *
 * 共享客户端同时承担“调用端代理”和“服务端路由声明”两种职责。服务端 Controller
 * 继承客户端后只需在构造函数中传入真实实现，继承的方法会自动保留共享路由元数据，
 * 从而不再重复声明 Nest 路由装饰器或复制接口签名。
 */
export abstract class FeignWebClient<TImplementation extends object> {
    private readonly implementation?: TImplementation
    /** 由宿主服务的 ConfigModule 注入，用于读取 Nacos 中的服务间凭据。 */
    @Inject(ConfigService)
    private configService?: ConfigService

    protected constructor(implementation?: TImplementation, configService?: ConfigService) {
        this.implementation = implementation
        if (configService) this.configService = configService
    }

    /** 将共享客户端方法转发给服务端业务实现；调用端代理不会执行此方法。 */
    protected dispatch<TMethod extends keyof TImplementation>(
        method: TMethod,
        ...args: TImplementation[TMethod] extends (...parameters: infer TParameters) => unknown ? TParameters : never
    ): TImplementation[TMethod] extends (...parameters: any[]) => infer TResult ? TResult : never {
        if (!this.implementation) throw new Error(`${this.constructor.name} 必须由 FeignModule 注入或提供服务实现`)
        this.assertAuthorization(args)
        const handler = this.implementation[method]
        if (typeof handler !== 'function') throw new Error(`Feign 服务实现缺少 ${String(method)} 方法`)
        return handler.apply(this.implementation, args) as TImplementation[TMethod] extends (...parameters: any[]) => infer TResult
            ? TResult
            : never
    }

    /** 校验服务端 Feign 请求携带的 Bearer 凭据，并按客户端配置校验服务间令牌。 */
    private assertAuthorization(args: unknown[]): void {
        const options = getFeignClientOptions(this.constructor as FeignTypes.FeignClientConstructor)
        if (!options) throw new Error(`${this.constructor.name} 缺少 FeignClient 配置`)

        const authorization = args[0]
        const authorizationMatch = typeof authorization === 'string' ? authorization.match(/^Bearer\s+([^\s]+)$/i) : undefined
        if (!authorizationMatch) throw new UnauthorizedException('缺少有效的 Bearer 访问令牌')

        // Account 内省接口接收的是待校验的用户访问令牌，不应与固定服务令牌比较；
        // 只有明确声明 serviceTokenKey 的服务端 Feign 接口才执行服务间凭据校验。
        if (!options.serviceTokenKey) return
        if (!this.configService) throw new Error(`${this.constructor.name} 未注入 ConfigService，无法校验服务间凭据`)

        const configured = this.configService.get<unknown>(options.serviceTokenKey)
        if (typeof configured !== 'string' || !configured.trim()) {
            throw new ServiceUnavailableException(`Nacos 配置 ${options.serviceTokenKey} 未配置服务间凭据`)
        }
        const configuredToken = configured.trim().replace(/^Bearer\s+/i, '')
        if (!configuredToken || !this.secureEquals(authorizationMatch[1], configuredToken)) {
            throw new UnauthorizedException('服务间 Bearer 凭据无效')
        }
    }

    /** 使用定时安全比较，避免直接字符串比较泄露令牌差异。 */
    private secureEquals(left: string, right: string): boolean {
        const leftBuffer = Buffer.from(left)
        const rightBuffer = Buffer.from(right)
        return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
    }
}
