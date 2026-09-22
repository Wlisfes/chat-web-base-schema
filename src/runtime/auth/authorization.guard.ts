import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthenticatedRequest } from './auth.interface'
import { REQUIRED_PERMISSIONS } from './auth.decorator'
import { AuthorizationService } from './authorization.service'

/** 根据 RequirePermissions 元数据调用 Auth 权限中心进行统一授权，并挂载数据范围。 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authorizationService: AuthorizationService
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS, [context.getHandler(), context.getClass()]) ?? []
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
        const user = request.user
        if (!required.length && !user) return true
        if (!user) {
            throw new ForbiddenException(`缺少权限：${required.join(', ')}`)
        }
        // 权限校验与授权身份同时依赖同一批权限码，并发获取避免两次串行 Feign 往返。
        const [allowed, authorized] = await Promise.all([
            required.length ? this.authorizationService.hasPermission(user.uid, required) : Promise.resolve(true),
            this.authorizationService.resolveAuthorizedPrincipal(user.uid, required)
        ])
        if (!allowed) {
            throw new ForbiddenException(`缺少权限：${required.join(', ')}`)
        }
        request.user = { ...user, ...authorized }
        return true
    }
}
