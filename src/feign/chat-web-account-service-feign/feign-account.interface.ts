import type { AuthPrincipal } from '@/runtime/auth/auth.interface'

/** 账号服务 Feign 服务端实现必须满足的接口。 */
export interface AccountFeignServiceImplementation {
    /** 校验 Bearer Token 并返回身份主体。 */
    introspect(authorization: string): Promise<AuthPrincipal>
}
