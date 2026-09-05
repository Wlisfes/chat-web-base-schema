import { CanActivate, ExecutionContext, Injectable, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_ROUTE } from './auth.decorator'
import { AuthenticatedRequest } from './auth.interface'
import { GATEWAY_PRINCIPAL_HEADER, getGatewayPrincipalMaxAge, getGatewayPrincipalSecret, verifyGatewayPrincipal } from './gateway-principal'

/**
 * 业务服务的入口守卫。
 *
 * 用户认证在网关完成一次，业务服务只校验网关签发的身份上下文签名，不再远程内省，
 * 也不持有 JWT 密钥。签名校验保证即使业务服务在内网可直连，也无法伪造身份。
 */
@Injectable()
export class GatewayPrincipalGuard implements CanActivate, OnApplicationBootstrap {
    constructor(
        private readonly reflector: Reflector,
        private readonly configService: ConfigService
    ) {}

    /** 启动时校验签名配置，避免首个受保护请求才暴露配置缺失。 */
    public onApplicationBootstrap(): void {
        getGatewayPrincipalSecret(this.configService)
        getGatewayPrincipalMaxAge(this.configService)
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [context.getHandler(), context.getClass()])
        if (isPublic) {
            return true
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
        const principal = verifyGatewayPrincipal(
            request.header(GATEWAY_PRINCIPAL_HEADER) ?? undefined,
            getGatewayPrincipalSecret(this.configService),
            getGatewayPrincipalMaxAge(this.configService)
        )
        if (!principal) {
            throw new UnauthorizedException('缺少有效的网关身份上下文')
        }

        request.user = principal
        return true
    }
}
