import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator'

/** Auth 权限校验服务间请求。 */
export class AuthPermissionCheckRequestDto {
    @ApiProperty({ description: '待校验用户 UID', example: '2281665656346656771' })
    @IsString({ message: '用户 UID 必须是字符串' })
    @IsNotEmpty({ message: '用户 UID 必填' })
    @MaxLength(19, { message: '用户 UID 长度不能超过19位' })
    uid: string

    @ApiProperty({ description: '需要同时拥有的权限码', type: [String], example: ['finance:brand:list'] })
    @IsArray({ message: '权限码必须是数组' })
    permissionCodes: string[]
}

/** Auth 权限校验服务间响应。 */
export class AuthPermissionCheckResponseDto {
    @ApiProperty({ description: '是否拥有全部权限码', example: true })
    allowed: boolean
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

/** Auth 数据权限查询请求。 */
export class AuthDataScopeRequestDto {
    @ApiProperty({ description: '待查询用户 UID', example: '2281665656346656771' })
    @IsString({ message: '用户 UID 必须是字符串' })
    @IsNotEmpty({ message: '用户 UID 必填' })
    uid: string

    @ApiProperty({ description: '业务资源编码', example: 'account:user' })
    @IsString({ message: '资源编码必须是字符串' })
    @IsNotEmpty({ message: '资源编码必填' })
    @MaxLength(128, { message: '资源编码长度不能超过128位' })
    resourceCode: string
}

/** Auth 数据权限查询响应。 */
export class AuthDataScopeResponseDto {
    @ApiProperty({ description: '是否拥有全部数据权限', example: false })
    all: boolean

    @ApiProperty({ description: '是否包含本人数据', example: true })
    includeSelf: boolean

    @ApiProperty({ description: '可访问的组织主键', type: [Number], example: [1, 2, 3] })
    organizationKeyIds: number[]
}

/** Auth 超级管理员判断响应。 */
export class AuthSuperAdminResponseDto {
    @ApiProperty({ description: '是否为超级管理员', example: false })
    superAdmin: boolean
}

/** Auth 超级管理员判断请求。 */
export class AuthUidRequestDto {
    @ApiProperty({ description: '待判断用户 UID', example: '2281665656346656771' })
    @IsString({ message: '用户 UID 必须是字符串' })
    @IsNotEmpty({ message: '用户 UID 必填' })
    uid: string
}
