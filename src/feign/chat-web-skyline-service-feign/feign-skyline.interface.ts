import type * as SkylineDto from './feign-skyline.dto'

/**枚举字典选项数据。*/
export type SkylineChunkOption = SkylineDto.SkylineChunkOptionDto
/**按枚举类型编码分组的枚举字典选项数据。*/
export type SkylineChunkOptionGroup = SkylineDto.SkylineChunkOptionGroupDto
/**按枚举类型编码批量查询枚举字典选项的请求入参。*/
export type SkylineColumnChunkOptionInput = SkylineDto.SkylineColumnChunkOptionRequestDto
/**按枚举业务值解析单个枚举字典选项的请求入参。*/
export type SkylineChunkOptionResolverInput = SkylineDto.SkylineChunkOptionResolverRequestDto

/** Skyline 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientSkylineImplementation {
    /**按枚举类型编码批量获取启用状态的枚举字典选项**/
    httpBaseSkylineColumnChunkOption(authorization: string, input: SkylineColumnChunkOptionInput): Promise<SkylineChunkOptionGroup[]>
    /**按枚举业务值解析单个启用状态的枚举字典选项**/
    httpBaseSkylineChunkOptionResolver(authorization: string, input: SkylineChunkOptionResolverInput): Promise<SkylineChunkOption>
}
