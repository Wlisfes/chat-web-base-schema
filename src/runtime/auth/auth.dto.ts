import { ApiProperty } from '@nestjs/swagger'

/** 账号服务令牌内省接口返回的身份主体文档模型。 */
export class AuthPrincipalResponseDto {
    @ApiProperty({ description: '账号 UID', example: '2149446185344106496' })
    uid: string

    @ApiProperty({ description: '登录会话 ID', format: 'uuid', example: 'a56b8b36-1d86-4cf2-9c98-63f4134c83d0' })
    sessionId: string
}
