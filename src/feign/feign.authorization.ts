import { ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/** 服务间共享凭据配置键。 */
const FEIGN_SERVICE_TOKEN_CONFIG_KEY = 'feign.service_token'

/**
 * 读取服务间共享凭据并组装业务 Feign 调用使用的 Authorization 头部。
 *
 * 业务 Feign 接口的 Authorization 位承载调用方身份，不承载终端用户令牌；转发用户
 * 令牌会让跨服务基础查询受权限码和数据范围约束，因此调用端统一使用服务凭据。
 */
export function resolveFeignServiceAuthorization(configService: ConfigService): string {
    const configured = configService.get<unknown>(FEIGN_SERVICE_TOKEN_CONFIG_KEY)
    if (typeof configured !== 'string' || !configured.trim()) {
        throw new ServiceUnavailableException(`Nacos 配置 ${FEIGN_SERVICE_TOKEN_CONFIG_KEY} 未配置服务间凭据`)
    }
    const token = configured.trim().replace(/^Bearer\s+/i, '')
    if (!token) {
        throw new ServiceUnavailableException(`Nacos 配置 ${FEIGN_SERVICE_TOKEN_CONFIG_KEY} 未配置服务间凭据`)
    }
    return `Bearer ${token}`
}
