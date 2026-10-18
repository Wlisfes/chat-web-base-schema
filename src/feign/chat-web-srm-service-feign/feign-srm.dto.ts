import { ApiProperty, IntersectionType, PartialType, PickType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator'
import * as Schema from '@/schema/chat-web-srm-mysql'
import { PageResponseDataDto } from '@/decorator'
import { PageDto } from '@/utils'

/** SRM 供应商服务间响应摘要。 */
export class SrmUserResponseDto extends Schema.TbSrmUserDto {}

/** SRM 供应商分页响应。 */
export class SrmUserPageResponseDto extends PageResponseDataDto {
    @ApiProperty({ description: '供应商列表', type: [SrmUserResponseDto] })
    list: SrmUserResponseDto[]
}

/** SRM 供应商详情服务间请求。 */
export class SrmResolveUserRequestDto extends PickType(Schema.TbSrmUserDto, ['keyId'] as const) {
    @ApiProperty({ description: '供应商主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '供应商主键必须是整数' })
    @Min(1, { message: '供应商主键必须大于0' })
    keyId: number
}

/** SRM 供应商批量详情服务间请求，单次最多 100 个主键。 */
export class SrmColumnUserResolverRequestDto {
    @ApiProperty({ description: '供应商主键集合', type: Number, isArray: true, example: [10241000] })
    @IsArray({ message: '供应商主键集合必须是数组' })
    @ArrayNotEmpty({ message: '供应商主键集合不能为空' })
    @ArrayMaxSize(100, { message: '供应商主键集合单次最多100个' })
    @Type(() => Number)
    @IsInt({ each: true, message: '供应商主键必须是整数' })
    @Min(1, { each: true, message: '供应商主键必须大于0' })
    keyIds: number[]
}

/** SRM 供应商分页服务间请求。 */
export class SrmListUserRequestDto extends IntersectionType(
    PageDto,
    PartialType(PickType(Schema.TbSrmUserDto, ['name', 'status', 'currency', 'payMode', 'source'] as const))
) {}
