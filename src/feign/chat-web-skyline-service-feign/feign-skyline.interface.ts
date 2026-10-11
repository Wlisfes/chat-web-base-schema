import type { TbSkylineUserEmploymentStatus, TbSkylineUserStatus } from '@/schema/chat-web-skyline-mysql'
import type { SKYLINE_USER_RESOLVER_FIELDS } from './feign-skyline.constants'
import type * as SkylineDto from './feign-skyline.dto'

/**枚举字典选项数据。*/
export type SkylineChunkOption = SkylineDto.SkylineChunkOptionDto
/**按枚举类型编码分组的枚举字典选项数据。*/
export type SkylineChunkOptionGroup = SkylineDto.SkylineChunkOptionGroupDto
/**以请求枚举类型编码为 key 的枚举字典选项分组对象。*/
export type SkylineChunkOptionRecord = Partial<Record<SkylineDto.SkylineChunkOptionGroupDto['type'], SkylineChunkOptionGroup>>
/**按枚举类型编码批量查询枚举字典选项的请求入参。*/
export type SkylineColumnChunkOptionInput = SkylineDto.SkylineColumnChunkOptionRequestDto
/**按枚举业务值解析单个枚举字典选项的请求入参。*/
export type SkylineChunkOptionResolverInput = SkylineDto.SkylineChunkOptionResolverRequestDto

/**账号批量还原允许返回的字段。*/
export type SkylineUserField = (typeof SKYLINE_USER_RESOLVER_FIELDS)[number]

/**账号所属组织摘要，仅返回启用的成员关系和启用的组织。*/
export interface SkylineUserOrganizationSummary {
    /**组织主键。*/
    keyId: number
    /**组织名称。*/
    name: string
    /**组织编码。*/
    code: string
    /**是否主组织。*/
    isPrimary: boolean
    /**组织内岗位名称。*/
    postName?: string
}

/**Skyline 账号服务用户展示摘要，供跨服务把操作人 UID 还原为可读信息使用；默认字段始终返回，扩展字段只在请求 fields 时返回。*/
export interface SkylineUserSummary {
    /**账号 UID。*/
    uid: string
    /**账号工号。*/
    number?: string
    /**账号姓名。*/
    name?: string
    /**账号头像。*/
    avatar?: string
    /**账号手机号，仅请求 phone 时返回。*/
    phone?: string
    /**账号邮箱，仅请求 email 时返回。*/
    email?: string
    /**账号状态，仅请求 status 时返回。*/
    status?: TbSkylineUserStatus
    /**员工在职状态，仅请求 employmentStatus 时返回。*/
    employmentStatus?: TbSkylineUserEmploymentStatus
    /**账号所属组织，仅请求 organizations 时返回。*/
    organizations?: SkylineUserOrganizationSummary[]
}

/**列表展示使用的账号选项；字段集合为默认字段加请求 fields，账号不存在时只保留 uid。*/
export type SkylineUserOption = SkylineUserSummary

/**为指定 UID 字段追加 `<字段名>Options` 后的列表项类型。*/
export type WithSkylineUserOptions<TItem, TKey extends keyof TItem & string> = TItem & {
    [K in TKey as `${K}Options`]?: SkylineUserOption
}

/**按列表批量还原账号展示摘要的请求体。*/
export interface SkylineColumnUserResolverRequest {
    /**待查询的账号 UID 集合，单次上限 100 个。*/
    uids: string[]
    /**需要额外返回的账号字段；uid、number、name、avatar 默认始终返回。*/
    fields?: SkylineUserField[]
}

/**按账号 UID 还原单个展示摘要的请求体。*/
export interface SkylineUserResolverRequest {
    /**待查询的账号 UID。*/
    uid: string
    /**需要额外返回的账号字段；uid、number、name、avatar 默认始终返回。*/
    fields?: SkylineUserField[]
}

/** Skyline 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientSkylineImplementation {
    /**按枚举类型编码批量获取启用状态的枚举字典选项**/
    httpBaseSkylineChunkOptionColumn(authorization: string, input: SkylineColumnChunkOptionInput): Promise<SkylineChunkOptionRecord>
    /**按枚举业务值解析单个启用状态的枚举字典选项**/
    httpBaseSkylineChunkOptionResolver(authorization: string, input: SkylineChunkOptionResolverInput): Promise<SkylineChunkOption>
    /**按列表批量把账号 UID 还原为展示摘要**/
    httpBaseSkylineColumnUserResolver(authorization: string, input: SkylineColumnUserResolverRequest): Promise<SkylineUserSummary[]>
    /**按账号 UID 还原单个展示摘要**/
    httpBaseSkylineUserResolver(authorization: string, input: SkylineUserResolverRequest): Promise<SkylineUserSummary>
}
