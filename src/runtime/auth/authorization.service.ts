import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FeignClientAuthManager } from '../../feign/chat-web-auth-service-feign/feign-auth.client.controller'
import { resolveFeignServiceAuthorization } from '../../feign/feign.authorization'
import type {
    AuthAuthorizedPrincipalResult,
    AuthDataScopeResult,
    AuthPermissionCacheInvalidateInput,
    AuthSuperAdminResult
} from '../../feign/chat-web-auth-service-feign/feign-auth.interface'

/** 业务服务侧权限结果的进程内缓存条目。 */
type AuthorizationCacheEntry<T> = { expiredAt: number; value: Promise<T> }

/** 进程内缓存存活时间；Auth 自身缓存 60 秒，这里只做同一批并发请求的合并与短时复用。 */
const AUTHORIZATION_CACHE_MILLISECONDS = 5000

/** 业务服务调用 Auth 权限中心的统一适配服务。 */
@Injectable()
export class AuthorizationService {
    private readonly logger = new Logger(AuthorizationService.name)

    /** 权限结果进程内缓存；同一用户的并发请求共享同一次 Feign 调用。 */
    private readonly cache = new Map<string, AuthorizationCacheEntry<unknown>>()

    constructor(
        private readonly authClient: FeignClientAuthManager,
        private readonly configService: ConfigService
    ) {}

    public async hasPermission(uid: string, permissionCodes: string[]): Promise<boolean> {
        const codes = this.normalize(permissionCodes)
        const result = await this.withCache<{ allowed: boolean }>(`permission:${uid}:${codes.join(',')}`, () =>
            this.authClient.checkPermission(this.authorization(), { uid, permissionCodes })
        )
        return result.allowed
    }

    public async isSuperAdmin(uid: string): Promise<boolean> {
        const result = await this.withCache<AuthSuperAdminResult>(`super-admin:${uid}`, () =>
            this.authClient.checkSuperAdmin(this.authorization(), { uid })
        )
        return result.superAdmin
    }

    public async resolveDataScope(uid: string, resourceCode: string): Promise<AuthDataScopeResult> {
        return this.withCache<AuthDataScopeResult>(`data-scope:${uid}:${resourceCode}`, () =>
            this.authClient.resolveDataScope(this.authorization(), { uid, resourceCode })
        )
    }

    public async resolveAuthorizedPrincipal(uid: string, permissionCodes: string[]): Promise<AuthAuthorizedPrincipalResult> {
        const codes = this.normalize(permissionCodes)
        return this.withCache<AuthAuthorizedPrincipalResult>(`authorized:${uid}:${codes.join(',')}`, () =>
            this.authClient.resolveAuthorizedPrincipal(this.authorization(), { uid, permissionCodes })
        )
    }

    /** 缓存通知失败不回滚已提交事务，由 Auth 的短 TTL 兜底。 */
    public async invalidate(input: AuthPermissionCacheInvalidateInput): Promise<void> {
        this.cache.clear()
        try {
            await this.authClient.invalidatePermissionCache(this.authorization(), input)
        } catch (error) {
            this.logger.warn(`Auth 权限缓存失效通知失败：${error instanceof Error ? error.message : String(error)}`)
        }
    }

    /** 服务间调用凭据。 */
    private authorization(): string {
        return resolveFeignServiceAuthorization(this.configService)
    }

    /** 权限码归一化，保证缓存键与 Auth 侧计算口径一致。 */
    private normalize(permissionCodes: string[]): string[] {
        return [...new Set(permissionCodes.map(code => code.trim()).filter(Boolean))].sort()
    }

    /** 读取进程内缓存；未命中或已过期时发起一次 Feign 调用并缓存该 Promise。 */
    private withCache<T>(cacheKey: string, loader: () => Promise<T>): Promise<T> {
        const now = Date.now()
        const cached = this.cache.get(cacheKey)
        if (cached && cached.expiredAt > now) {
            return cached.value as Promise<T>
        }
        const value = loader().catch(error => {
            this.cache.delete(cacheKey)
            throw error
        })
        this.cache.set(cacheKey, { expiredAt: now + AUTHORIZATION_CACHE_MILLISECONDS, value })
        this.evictExpired(now)
        return value
    }

    /** 清理已过期条目，避免长期运行时缓存无限增长。 */
    private evictExpired(now: number): void {
        for (const [key, entry] of this.cache) {
            if (entry.expiredAt <= now) {
                this.cache.delete(key)
            }
        }
    }
}
