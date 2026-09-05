/**
 * 登录会话运行时。
 *
 * 只有认证所有者（鉴权服务）可以导入本子路径：它直接读写登录会话存储并需要 Redis
 * 客户端依赖。业务服务只导入 `auth` 子路径，通过内部认证协议校验令牌。
 */
export * from './auth-session.service'
export * from './session-authenticator.service'
export * from './session-auth.module'
