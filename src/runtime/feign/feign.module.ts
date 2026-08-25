import type { DynamicModule, Provider } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { FEIGN_FETCH } from './feign.constants'
import type { FeignClientConstructor } from './feign.interface'
import { FeignClientFactory } from './feign.service'

@Module({})
export class FeignModule {
    static register(clients: FeignClientConstructor[]): DynamicModule {
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
