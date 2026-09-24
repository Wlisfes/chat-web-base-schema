import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { TbSkylineChunkModule } from '@/schema/chat-web-skyline-mysql'

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

    @ApiProperty({ description: '子级枚举项列表', type: () => [SkylineChunkOptionDto] })
    children: SkylineChunkOptionDto[]
}

/** 按枚举类型编码分组的枚举字典选项。 */
export class SkylineChunkOptionGroupDto {
    @ApiProperty({ description: '枚举类型编码', example: 'CHUNK_DATETASK_STATUS' })
    type: string

    @ApiProperty({ description: '该类型下根级枚举项数量', example: 2 })
    count: number

    @ApiProperty({ description: '枚举项选项树', type: [SkylineChunkOptionDto] })
    options: SkylineChunkOptionDto[]
}

/** 按枚举类型编码批量查询枚举字典选项的请求。 */
export class SkylineColumnChunkOptionRequestDto {
    @ApiProperty({
        description: '枚举所属模块；不传表示不限制模块',
        required: false,
        enum: TbSkylineChunkModule,
        example: TbSkylineChunkModule.CHUNK_SYSTEM
    })
    @IsOptional()
    @IsEnum(TbSkylineChunkModule, { message: '枚举所属模块格式错误' })
    module?: TbSkylineChunkModule

    @ApiProperty({ description: '枚举类型编码列表', type: [String], example: ['CHUNK_DATETASK_STATUS'] })
    @IsArray({ message: '枚举类型编码列表必须是数组' })
    @ArrayNotEmpty({ message: '枚举类型编码列表不能为空' })
    @IsString({ each: true, message: '枚举类型编码必须是字符串' })
    @MaxLength(128, { each: true, message: '枚举类型编码长度不能超过128位' })
    types: string[]
}

/** 按枚举业务值解析单个枚举字典选项的请求。 */
export class SkylineChunkOptionResolverRequestDto {
    @ApiProperty({
        description: '枚举所属模块；不传表示不限制模块',
        required: false,
        enum: TbSkylineChunkModule,
        example: TbSkylineChunkModule.CHUNK_SYSTEM
    })
    @IsOptional()
    @IsEnum(TbSkylineChunkModule, { message: '枚举所属模块格式错误' })
    module?: TbSkylineChunkModule

    @ApiProperty({ description: '枚举类型编码', example: 'CHUNK_DATETASK_STATUS' })
    @IsString({ message: '枚举类型编码必须是字符串' })
    @IsNotEmpty({ message: '枚举类型编码必填' })
    @MaxLength(128, { message: '枚举类型编码长度不能超过128位' })
    type: string

    @ApiProperty({ description: '枚举项业务值', example: 'running' })
    @IsString({ message: '枚举项业务值必须是字符串' })
    @IsNotEmpty({ message: '枚举项业务值必填' })
    @MaxLength(128, { message: '枚举项业务值长度不能超过128位' })
    value: string
}
