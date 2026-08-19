import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { NACOS_RUNTIME_OPTIONS, NacosRuntimeOptions } from './nacos.interface'
import { NacosService } from './nacos.service'

@Global()
@Module({})
export class NacosModule {
    static forRoot(options: NacosRuntimeOptions): DynamicModule {
        return {
            module: NacosModule,
            imports: [ConfigModule],
            providers: [{ provide: NACOS_RUNTIME_OPTIONS, useValue: options }, NacosService],
            exports: [NacosService]
        }
    }
}
