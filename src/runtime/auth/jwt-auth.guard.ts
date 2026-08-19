import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_ROUTE } from './auth.decorator'
import { AuthenticatedRequest, AuthTokenAuthenticator } from './auth.interface'

export const AUTH_TOKEN_AUTHENTICATOR = Symbol('AUTH_TOKEN_AUTHENTICATOR')

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(AUTH_TOKEN_AUTHENTICATOR) private readonly authenticator: AuthTokenAuthenticator
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [context.getHandler(), context.getClass()])
        if (isPublic) {
            return true
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
        const authorization = request.header('authorization')
        const match = authorization?.match(/^Bearer\s+([^\s]+)$/i)
        if (!match) {
            throw new UnauthorizedException('缺少 Bearer 访问令牌')
        }

        request.user = await this.authenticator.authenticateToken(match[1])
        return true
    }
}
