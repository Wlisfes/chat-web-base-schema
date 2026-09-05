import { Module } from '@nestjs/common'
import { GatewayPrincipalGuard } from './gateway-principal.guard'

/**
 * 业务服务的认证模块。
 *
 * 认证由网关统一完成并以签名头部下发，业务服务只做本地验签：不持有 JWT 密钥、
 * 不访问登录会话存储、也不发起任何远程内省调用。
 */
@Module({
    providers: [GatewayPrincipalGuard],
    exports: [GatewayPrincipalGuard]
})
export class GatewayPrincipalModule {}
