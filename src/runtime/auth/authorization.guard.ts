import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthenticatedRequest } from './auth.interface'
import { REQUIRED_PERMISSIONS } from './auth.decorator'
import { AuthorizationService } from './authorization.service'

/** 仅在使用 RequirePermissions 时调用 Auth 校验权限，并挂载角色与数据范围。 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authorizationService: AuthorizationService
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS, [context.getHandler(), context.getClass()])
        if (!required?.length) return true
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
        const user = request.user
        if (!user) {
            throw new ForbiddenException(`缺少权限：${required.join(', ')}`)
        }
        const { allowed, ...authorization } = await this.authorizationService.resolveAuthorizedPrincipal(user.uid, required)
        if (!allowed) {
            throw new ForbiddenException(`缺少权限：${required.join(', ')}`)
        }
        request.user = { ...user, ...authorization }
        return true
    }
}
