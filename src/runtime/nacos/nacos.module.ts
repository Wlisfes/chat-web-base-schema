import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { NACOS_RUNTIME_OPTIONS, NacosRuntimeOptions } from './nacos.interface'
import { createNacosRuntimeOptions, NacosRuntimeDefaults } from './nacos.options'
import { NacosService } from './nacos.service'

function isCompleteRuntimeOptions(options: NacosRuntimeOptions | NacosRuntimeDefaults): options is NacosRuntimeOptions {
    return 'serverAddr' in options || 'namespace' in options
}

@Global()
@Module({})
export class NacosModule {
    static forRoot(options: NacosRuntimeOptions | NacosRuntimeDefaults): DynamicModule {
        const runtimeOptionsProvider = isCompleteRuntimeOptions(options)
            ? { provide: NACOS_RUNTIME_OPTIONS, useValue: options }
            : { provide: NACOS_RUNTIME_OPTIONS, useFactory: () => createNacosRuntimeOptions(options) }

        return {
            module: NacosModule,
            imports: [ConfigModule],
            providers: [runtimeOptionsProvider, NacosService],
            exports: [NacosService]
        }
    }
}
