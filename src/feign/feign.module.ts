import type { FeignClientConstructor } from './feign.interface'
import { DynamicModule, Provider } from '@nestjs/common'
import { FeignClientFactory } from './feign.service'
import { FEIGN_FETCH } from './feign.constants'
import { Module } from '@nestjs/common'

/** 注册一个或多个声明式 Feign 客户端的动态模块。 */
@Module({})
export class FeignModule {
    /** 为每个客户端创建代理 Provider，并导出给业务模块注入。 */
    static register(clients: FeignClientConstructor[]): DynamicModule {
        /** 每个客户端对应一个延迟创建的代理 Provider。 */
        const clientProviders: Provider[] = clients.map(client => ({
            provide: client,
            useFactory: (factory: FeignClientFactory) => factory.create(client),
            inject: [FeignClientFactory]
        }))
        return {
            module: FeignModule,
            providers: [FeignClientFactory, { provide: FEIGN_FETCH, useValue: fetch }, ...clientProviders],
            exports: [...clients]
        }
    }
}
