import type { AuthPrincipal } from '@/runtime/auth/auth.interface'

export interface FeignClientAccountImplementation {
    /**供内部服务校验访问令牌并获取身份主体**/
    introspect(authorization: string): Promise<AuthPrincipal>
}
