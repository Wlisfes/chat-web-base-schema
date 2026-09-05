import { Module } from '@nestjs/common'
import { AuthInternalClient } from './auth-internal.client'
import { AUTH_TOKEN_AUTHENTICATOR, JwtAuthGuard } from './jwt-auth.guard'

/**
 * 业务服务的远程认证模块。
 *
 * 认证统一由鉴权服务负责，业务服务只通过内部认证协议校验令牌，不持有 JWT 密钥、
 * 不访问登录会话存储，也不把认证调用注册为业务 Feign 客户端。
 */
@Module({
    providers: [AuthInternalClient, JwtAuthGuard, { provide: AUTH_TOKEN_AUTHENTICATOR, useExisting: AuthInternalClient }],
    exports: [AuthInternalClient, JwtAuthGuard]
})
export class AuthModule {}
