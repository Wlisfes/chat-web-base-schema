import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RABBITMQ_RUNTIME_OPTIONS, RabbitmqRuntimeOptions } from './rabbitmq.interface'
import { RabbitmqService } from './rabbitmq.service'

/** RabbitMQ 运行时模块；每个服务通过 forRoot 声明自己的虚拟主机和拓扑。 */
@Global()
@Module({})
export class RabbitmqModule {
    static forRoot(options: RabbitmqRuntimeOptions): DynamicModule {
        return {
            module: RabbitmqModule,
            imports: [ConfigModule],
            providers: [{ provide: RABBITMQ_RUNTIME_OPTIONS, useValue: options }, RabbitmqService],
            exports: [RabbitmqService]
        }
    }
}
