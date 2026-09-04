import { BadGatewayException, Injectable } from '@nestjs/common'
import { FeignClientAccountManager } from '@/feign/chat-web-account-service-feign/feign-account.client.controller'
import type { AuthPrincipal, AuthTokenAuthenticator } from './auth.interface'

@Injectable()
export class AuthClient implements AuthTokenAuthenticator {
    constructor(private readonly accountFeignClient: FeignClientAccountManager) {}

    async authenticateToken(token: string): Promise<AuthPrincipal> {
        const principal = await this.accountFeignClient.introspect(`Bearer ${token}`)
        if (!this.isPrincipal(principal)) {
            throw new BadGatewayException('账号鉴权服务返回了无效身份主体')
        }
        return principal
    }

    private isPrincipal(value: unknown): value is AuthPrincipal {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return false
        const principal = value as Partial<AuthPrincipal>
        return (
            typeof principal.uid === 'string' &&
            principal.uid.length > 0 &&
            typeof principal.sessionId === 'string' &&
            principal.sessionId.length > 0
        )
    }
}
