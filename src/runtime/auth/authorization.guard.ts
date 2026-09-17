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
        if (required.length && !(await this.authorizationService.hasPermission(user.uid, required))) {
            throw new ForbiddenException(`缺少权限：${required.join(', ')}`)
        }
        const authorized = await this.authorizationService.resolveAuthorizedPrincipal(user.uid, required)
        request.user = { ...user, ...authorized }
        return true
    }
}
