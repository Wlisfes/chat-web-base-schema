import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FeignClientAuthManager } from '../../feign/chat-web-auth-service-feign/feign-auth.client.controller'
import { resolveFeignServiceAuthorization } from '../../feign/feign.authorization'
import type { AuthDataScopeResult, AuthPermissionCacheInvalidateInput } from '../../feign/chat-web-auth-service-feign/feign-auth.interface'

/** 业务服务调用 Auth 权限中心的统一适配服务。 */
@Injectable()
export class AuthorizationService {
    private readonly logger = new Logger(AuthorizationService.name)

    constructor(
        private readonly authClient: FeignClientAuthManager,
        private readonly configService: ConfigService
    ) {}

    public async hasPermission(uid: string, permissionCodes: string[]): Promise<boolean> {
        return (await this.authClient.checkPermission(this.authorization(), { uid, permissionCodes })).allowed
    }

    public async isSuperAdmin(uid: string): Promise<boolean> {
        return (await this.authClient.checkSuperAdmin(this.authorization(), { uid })).superAdmin
    }

    public async resolveDataScope(uid: string, resourceCode: string): Promise<AuthDataScopeResult> {
        return this.authClient.resolveDataScope(this.authorization(), { uid, resourceCode })
    }

    /** 缓存通知失败不回滚已提交事务，由 Auth 的短 TTL 兜底。 */
    public async invalidate(input: AuthPermissionCacheInvalidateInput): Promise<void> {
        try {
            await this.authClient.invalidatePermissionCache(this.authorization(), input)
        } catch (error) {
            this.logger.warn(`Auth 权限缓存失效通知失败：${error instanceof Error ? error.message : String(error)}`)
        }
    }

    private authorization(): string {
        return resolveFeignServiceAuthorization(this.configService)
    }
}
