import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    ArrayMaxSize,
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min
} from 'class-validator'
import {
    TbSkylineChunkModule,
    TbSkylineChunkModuleType,
    TbSkylineCountryStatus,
    TbSkylineUserEmploymentStatus,
    TbSkylineUserStatus
} from '@/schema/chat-web-skyline-mysql'
import { SKYLINE_USER_RESOLVER_FIELDS } from './feign-skyline.constants'
import type * as SkylineTypes from './feign-skyline.interface'

/** Skyline 枚举字典选项；value、label、description 与前后端统一的下拉协议保持一致。 */
export class SkylineChunkOptionDto {
    @ApiProperty({ description: '枚举项业务值', example: 'running' })
    value: string

    @ApiProperty({ description: '枚举项展示名称', example: '运行中' })
    label: string

    @ApiProperty({ description: '枚举项说明；取自扩展配置的 description 字段', example: '任务正在执行中' })
    description: string

    @ApiProperty({ description: '枚举项主键', example: 10000 })
    keyId: number

    @ApiProperty({ description: '父枚举项主键；根节点为空', required: false, nullable: true, example: null })
    pid: number

    @ApiProperty({ description: '枚举项排序值，数值越小越靠前', example: 1 })
    sort: number

    @ApiProperty({ description: '枚举项扩展配置', type: Object, required: false, nullable: true, example: { type: 'success' } })
    json: Record<string, unknown>

    @ApiProperty({ description: '子级枚举项列表；无下级的叶子节点不返回该字段', type: () => [SkylineChunkOptionDto], required: false })
    children?: SkylineChunkOptionDto[]
}

/** 按枚举类型编码分组的枚举字典选项。 */
export class SkylineChunkOptionGroupDto {
    @ApiProperty({
        description: '枚举类型编码',
        enum: TbSkylineChunkModuleType,
        enumName: 'TbSkylineChunkModuleType',
        example: TbSkylineChunkModuleType.CHUNK_SKYLINE_USER_POST
    })
    type: TbSkylineChunkModuleType

    @ApiProperty({ description: '该类型下根级枚举项数量', example: 2 })
    count: number

    @ApiProperty({ description: '枚举项选项树', type: [SkylineChunkOptionDto] })
    options: SkylineChunkOptionDto[]
}

/** 以枚举类型编码为 key 的分组对象文档 Schema。 */
export const SkylineChunkOptionRecordSchema = {
    type: 'object' as const,
    additionalProperties: { $ref: getSchemaPath(SkylineChunkOptionGroupDto) },
    example: {
        [TbSkylineChunkModuleType.CHUNK_SKYLINE_USER_POST]: {
            type: TbSkylineChunkModuleType.CHUNK_SKYLINE_USER_POST,
            count: 1,
            options: [
                {
                    value: '1001',
                    label: '前端开发工程师',
                    description: '前端开发工程师',
                    keyId: 1001,
                    pid: null,
                    sort: 1,
                    json: {}
                }
            ]
        }
    }
}

/** 按枚举类型编码批量查询枚举字典选项的请求。 */
export class SkylineColumnChunkOptionRequestDto {
    @ApiProperty({
        description: '枚举所属模块；不传表示不限制模块',
        required: false,
        enum: TbSkylineChunkModule,
        example: TbSkylineChunkModule.CHUNK_SKYLINE
    })
    @IsOptional()
    @IsEnum(TbSkylineChunkModule, { message: '枚举所属模块格式错误' })
    module?: TbSkylineChunkModule

    @ApiProperty({
        description: '枚举类型编码列表',
        enum: TbSkylineChunkModuleType,
        enumName: 'TbSkylineChunkModuleType',
        isArray: true,
        example: [TbSkylineChunkModuleType.CHUNK_SKYLINE_USER_POST]
    })
    @IsArray({ message: '枚举类型编码列表必须是数组' })
    @ArrayNotEmpty({ message: '枚举类型编码列表不能为空' })
    @IsEnum(TbSkylineChunkModuleType, { each: true, message: '枚举类型编码格式错误' })
    types: TbSkylineChunkModuleType[]
}

/** 按枚举业务值解析单个枚举字典选项的请求。 */
export class SkylineChunkOptionResolverRequestDto {
    @ApiProperty({
        description: '枚举所属模块；不传表示不限制模块',
        required: false,
        enum: TbSkylineChunkModule,
        example: TbSkylineChunkModule.CHUNK_SKYLINE
    })
    @IsOptional()
    @IsEnum(TbSkylineChunkModule, { message: '枚举所属模块格式错误' })
    module?: TbSkylineChunkModule

    @ApiProperty({
        description: '枚举类型编码',
        enum: TbSkylineChunkModuleType,
        enumName: 'TbSkylineChunkModuleType',
        example: TbSkylineChunkModuleType.CHUNK_SKYLINE_USER_POST
    })
    @IsEnum(TbSkylineChunkModuleType, { message: '枚举类型编码格式错误' })
    type: TbSkylineChunkModuleType

    @ApiProperty({ description: '枚举项业务值', example: 'running' })
    @IsString({ message: '枚举项业务值必须是字符串' })
    @IsNotEmpty({ message: '枚举项业务值必填' })
    @MaxLength(128, { message: '枚举项业务值长度不能超过128位' })
    value: string
}

/** 账号所属组织摘要的 Feign 响应文档模型。 */
export class SkylineUserOrganizationSummaryResponseDto {
    @ApiProperty({ description: '组织主键', example: 1 })
    keyId: number

    @ApiProperty({ description: '组织名称', example: '研发中心' })
    name: string

    @ApiProperty({ description: '组织编码', example: 'RD' })
    code: string

    @ApiProperty({ description: '是否主组织', example: true })
    isPrimary: boolean

    @ApiProperty({ description: '组织内岗位名称', required: false, example: '前端开发工程师' })
    postName?: string
}

/** 账号展示摘要的 Feign 响应文档模型；uid、number、name、avatar 默认返回，其余字段按请求 fields 返回。 */
export class SkylineUserSummaryResponseDto {
    @ApiProperty({ description: '账号 UID', example: '2149446185344106496' })
    uid: string

    @ApiProperty({ description: '账号工号，默认返回', required: false, example: 'A00001' })
    number?: string

    @ApiProperty({ description: '账号姓名，默认返回', required: false, example: '张三' })
    name?: string

    @ApiProperty({ description: '账号头像，默认返回', required: false, example: 'https://cdn.example.com/avatar.png' })
    avatar?: string

    @ApiProperty({ description: '账号手机号，仅请求 phone 时返回', required: false, example: '13800000000' })
    phone?: string

    @ApiProperty({ description: '账号邮箱，仅请求 email 时返回', required: false, example: 'zhangsan@example.com' })
    email?: string

    @ApiProperty({ description: '账号状态，仅请求 status 时返回', required: false, enum: TbSkylineUserStatus, example: 'enabled' })
    status?: TbSkylineUserStatus

    @ApiProperty({
        description: '员工在职状态，仅请求 employmentStatus 时返回',
        required: false,
        enum: TbSkylineUserEmploymentStatus,
        example: 'employed'
    })
    employmentStatus?: TbSkylineUserEmploymentStatus

    @ApiProperty({
        description: '账号所属组织，仅请求 organizations 时返回；只包含启用的成员关系和启用的组织',
        required: false,
        type: [SkylineUserOrganizationSummaryResponseDto]
    })
    organizations?: SkylineUserOrganizationSummaryResponseDto[]
}

/** 列表操作人展示选项的响应文档模型；字段集合为默认字段加请求 fields，账号不存在时只返回 uid。 */
export class SkylineUserOptionResponseDto extends SkylineUserSummaryResponseDto {}

/** 列表创建人、更新人展示选项；业务响应 DTO 可通过 IntersectionType 或 PickType 组合使用。 */
export class SkylineUserOptionsResponseDto {
    @ApiProperty({
        description: '创建人选项，通过 Skyline 账号 Feign 按 createBy 还原',
        type: SkylineUserOptionResponseDto,
        required: false
    })
    createByOptions?: SkylineUserOptionResponseDto

    @ApiProperty({
        description: '更新人选项，通过 Skyline 账号 Feign 按 modifyBy 还原',
        type: SkylineUserOptionResponseDto,
        required: false
    })
    modifyByOptions?: SkylineUserOptionResponseDto
}

/** 账号还原请求中可选的返回字段声明。 */
class SkylineUserFieldsDto {
    @ApiProperty({
        description: '需要额外返回的账号字段；uid、number、name、avatar 默认始终返回',
        required: false,
        enum: SKYLINE_USER_RESOLVER_FIELDS,
        isArray: true,
        example: ['organizations']
    })
    @IsOptional()
    @IsArray({ message: '账号返回字段必须是数组' })
    @IsIn(SKYLINE_USER_RESOLVER_FIELDS, { each: true, message: '账号返回字段不在允许范围内' })
    fields?: SkylineTypes.SkylineUserField[]
}

/**
 * 按列表批量还原账号展示摘要的请求体。
 *
 * 该接口只返回白名单中的展示字段，不做权限码校验和数据范围过滤，因此必须限制单次
 * 查询数量，避免被用于批量导出账号信息。
 */
export class SkylineColumnUserResolverDto extends SkylineUserFieldsDto {
    @ApiProperty({ description: '待查询的账号 UID 集合', type: String, isArray: true, example: ['2149446185344106496'] })
    @IsArray({ message: '账号UID集合必须是数组' })
    @ArrayNotEmpty({ message: '账号UID集合不能为空' })
    @ArrayMaxSize(100, { message: '账号UID集合单次最多100个' })
    @IsString({ each: true, message: '账号UID必须是字符串' })
    uids: string[]
}

/** 按账号 UID 还原单个展示摘要的请求体。 */
export class SkylineUserResolverDto extends SkylineUserFieldsDto {
    @ApiProperty({ description: '待查询的账号 UID', example: '2149446185344106496' })
    @IsString({ message: '账号UID必须是字符串' })
    @Matches(/^\d{1,19}$/, { message: '账号UID必须是1-19位数字字符串' })
    uid: string
}

/** 国家/地区展示摘要的 Feign 响应文档模型。 */
export class SkylineCountrySummaryResponseDto {
    @ApiProperty({ description: '国家/地区主键', example: 1000 })
    keyId: number

    @ApiProperty({ description: '国家/地区国际区号，不带 + 号', example: '86' })
    code: string

    @ApiProperty({ description: '移动国家代码', example: '460' })
    mcc: string

    @ApiProperty({ description: '中文名称', example: '中国' })
    cnName: string

    @ApiProperty({ description: '英文名称', example: 'China' })
    enName: string

    @ApiProperty({ description: '国家/地区状态', enum: TbSkylineCountryStatus, example: TbSkylineCountryStatus.ENABLE })
    status: TbSkylineCountryStatus
}

/** 按国家/地区主键批量查询展示摘要的请求体；单次最多 100 个，不存在的主键直接忽略。 */
export class SkylineColumnCountryResolverDto {
    @ApiProperty({ description: '国家/地区主键集合', type: Number, isArray: true, example: [1000] })
    @IsArray({ message: '国家/地区主键集合必须是数组' })
    @ArrayNotEmpty({ message: '国家/地区主键集合不能为空' })
    @ArrayMaxSize(100, { message: '国家/地区主键集合单次最多100个' })
    @Type(() => Number)
    @IsInt({ each: true, message: '国家/地区主键必须是整数' })
    @Min(1, { each: true, message: '国家/地区主键必须大于0' })
    keyIds: number[]
}

/** 按国家/地区主键查询单个展示摘要的请求体；不存在时返回 404。 */
export class SkylineCountryResolverDto {
    @ApiProperty({ description: '国家/地区主键', example: 1000 })
    @Type(() => Number)
    @IsInt({ message: '国家/地区主键必须是整数' })
    @Min(1, { message: '国家/地区主键必须大于0' })
    keyId: number
}
