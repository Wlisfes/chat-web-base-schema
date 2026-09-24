import type {
    SkylineColumnChunkOptionRequestDto,
    SkylineChunkOptionDto,
    SkylineChunkOptionGroupDto,
    SkylineResolveChunkOptionRequestDto
} from './feign-skyline.dto'

export type SkylineChunkOption = SkylineChunkOptionDto
export type SkylineChunkOptionGroup = SkylineChunkOptionGroupDto
export type SkylineColumnChunkOptionInput = SkylineColumnChunkOptionRequestDto
export type SkylineResolveChunkOptionInput = SkylineResolveChunkOptionRequestDto

/** Skyline 服务 Feign 服务端实现必须满足的接口。 */
export interface FeignClientSkylineImplementation {
    /**按枚举类型编码批量获取启用状态的枚举字典选项**/
    columnChunkOptions(authorization: string, input: SkylineColumnChunkOptionInput): Promise<SkylineChunkOptionGroup[]>
    /**按枚举业务值解析单个启用状态的枚举字典选项**/
    resolveChunkOption(authorization: string, input: SkylineResolveChunkOptionInput): Promise<SkylineChunkOption>
}
