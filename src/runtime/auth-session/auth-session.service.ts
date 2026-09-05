import { Injectable, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '../redis'
import { AccessTokenClaims } from '../auth/auth.interface'

@Injectable()
export class AuthSessionService implements OnApplicationBootstrap {
    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService
    ) {}

    onApplicationBootstrap(): void {
        this.getPrefix()
    }

    async create(claims: AccessTokenClaims): Promise<void> {
        await this.redisService.setEx(this.getKey(claims.jti), this.getRemainingSeconds(claims), claims.sub)
    }

    async assertActive(claims: AccessTokenClaims): Promise<void> {
        const userUid = await this.redisService.get(this.getKey(claims.jti))
        if (userUid !== claims.sub) {
            throw new UnauthorizedException('登录会话已失效，请重新登录')
        }
    }

    async rotate(oldSessionId: string, claims: AccessTokenClaims): Promise<void> {
        await this.redisService.rotate(this.getKey(oldSessionId), this.getKey(claims.jti), this.getRemainingSeconds(claims), claims.sub)
    }

    async revoke(sessionId: string): Promise<void> {
        await this.redisService.del(this.getKey(sessionId))
    }

    private getKey(sessionId: string): string {
        return `${this.getPrefix()}:${sessionId}`
    }

    private getPrefix(): string {
        const prefix = this.configService.get<unknown>('security.session.prefix')
        if (typeof prefix !== 'string' || !prefix.trim()) {
            throw new Error('Nacos 配置 security.session.prefix 必须是非空字符串')
        }
        return prefix.trim()
    }

    private getRemainingSeconds(claims: AccessTokenClaims): number {
        return Math.max(1, claims.exp - Math.floor(Date.now() / 1000))
    }
}
