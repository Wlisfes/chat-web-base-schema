import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator'

/** Auth 授权身份查询服务间请求。 */
export class AuthAuthorizedPrincipalRequestDto {
    @ApiProperty({ description: '待校验用户 UID', example: '2281665656346656771' })
    @IsString({ message: '用户 UID 必须是字符串' })
    @IsNotEmpty({ message: '用户 UID 必填' })
    @MaxLength(19, { message: '用户 UID 长度不能超过19位' })
    uid: string

    @ApiProperty({
        description: '权限码列表；多个权限码为或关系，传入 * 时跳过权限校验仍返回角色与数据权限',
        type: [String],
        example: ['finance:brand:list']
    })
    @IsArray({ message: '权限码必须是数组' })
    permissionCodes: string[]
}

/** Auth 权限缓存失效请求。至少提供用户 UID 或角色主键之一。 */
export class AuthPermissionCacheInvalidateRequestDto {
    @ApiProperty({ description: '需要清理的用户 UID', type: [String], required: false, example: ['2281665656346656771'] })
    uids?: string[]

    @ApiProperty({ description: '发生变更的角色主键', type: [Number], required: false, example: [10001] })
    roleKeyIds?: number[]
}

/** Auth 权限缓存失效响应。 */
export class AuthPermissionCacheInvalidateResponseDto {
    @ApiProperty({ description: '是否已完成缓存失效', example: true })
    success: boolean
}

/** Auth 授权身份与数据范围响应。 */
export class AuthAuthorizedPrincipalResponseDto {
    @ApiProperty({ description: '是否通过权限校验；传入 * 时为 true', example: true })
    allowed: boolean

    @ApiProperty({ description: '是否为超级管理员', example: false })
    superAdmin: boolean

    @ApiProperty({ description: '当前启用角色编码', type: [String], example: ['admin'] })
    roleCodes: string[]

    @ApiProperty({ description: '是否拥有全部数据；空 items 不能表示全部数据', example: false })
    all: boolean

    @ApiProperty({ description: '当前请求可访问的用户 UID 并集', type: [String], example: ['2281665656346656771'] })
    items: string[]
}
