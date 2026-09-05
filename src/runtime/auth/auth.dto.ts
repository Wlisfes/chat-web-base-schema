import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

/** 鉴权服务令牌内省接口返回的身份主体文档模型。 */
export class AuthPrincipalResponseDto {
    @ApiProperty({ description: '账号 UID', example: '2149446185344106496' })
    uid: string

    @ApiProperty({ description: '登录会话 ID', format: 'uuid', example: 'a56b8b36-1d86-4cf2-9c98-63f4134c83d0' })
    sessionId: string
}

/** 网关或内部服务提交给鉴权服务的访问令牌内省请求。 */
export class TokenIntrospectionDto {
    @ApiProperty({ description: '待校验的用户访问令牌，不包含 Bearer 前缀', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @IsString({ message: '访问令牌必须是字符串' })
    @IsNotEmpty({ message: '访问令牌必填' })
    @MaxLength(4096, { message: '访问令牌长度不能超过4096位' })
    token: string
}
