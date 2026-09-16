import { Global, Module } from '@nestjs/common'
import { FeignClientAuthManager } from '../../feign/chat-web-auth-service-feign/feign-auth.client.controller'
import { FeignModule } from '../../feign/feign.module'
import { AuthorizationGuard } from './authorization.guard'
import { AuthorizationService } from './authorization.service'

/** 业务服务权限调用适配模块；权限计算统一由 Auth 服务负责。 */
@Global()
@Module({
    imports: [FeignModule.register([FeignClientAuthManager])],
    providers: [AuthorizationService, AuthorizationGuard],
    exports: [AuthorizationService, AuthorizationGuard]
})
export class AuthorizationModule {}
