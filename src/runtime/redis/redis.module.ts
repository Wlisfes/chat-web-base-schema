import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { REDIS_RUNTIME_OPTIONS, RedisRuntimeOptions } from './redis.interface'
import { RedisService } from './redis.service'

@Global()
@Module({ providers: [RedisService], exports: [RedisService] })
export class RedisModule {
    static forRoot(options: RedisRuntimeOptions): DynamicModule {
        return {
            module: RedisModule,
            imports: [ConfigModule],
            providers: [{ provide: REDIS_RUNTIME_OPTIONS, useValue: options }, RedisService],
            exports: [RedisService]
        }
    }
}
