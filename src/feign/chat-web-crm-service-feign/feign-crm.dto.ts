import { ApiProperty, IntersectionType, PartialType, PickType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsInt, IsOptional, Min } from 'class-validator'
import * as Schema from '@/schema/chat-web-crm-mysql'
import { PageResponseDataDto } from '@/decorator'
import { PageDto } from '@/utils'

/** CRM 客户服务间响应摘要。 */
export class CrmUserResponseDto extends Schema.TbCrmUserDto {}

/** CRM 客户分页响应。 */
export class CrmUserPageResponseDto extends PageResponseDataDto {
    @ApiProperty({ description: '客户列表', type: [CrmUserResponseDto] })
    list: CrmUserResponseDto[]
}

/** CRM 客户详情服务间请求。 */
export class CrmResolveUserRequestDto extends PickType(Schema.TbCrmUserDto, ['keyId'] as const) {
    @ApiProperty({ description: '客户主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    keyId: number
}

/** CRM 客户批量详情服务间请求，单次最多 100 个主键。 */
export class CrmColumnUserResolverRequestDto {
    @ApiProperty({ description: '客户主键集合', type: Number, isArray: true, example: [10241000] })
    @IsArray({ message: '客户主键集合必须是数组' })
    @ArrayNotEmpty({ message: '客户主键集合不能为空' })
    @ArrayMaxSize(100, { message: '客户主键集合单次最多100个' })
    @Type(() => Number)
    @IsInt({ each: true, message: '客户主键必须是整数' })
    @Min(1, { each: true, message: '客户主键必须大于0' })
    keyIds: number[]
}

/** CRM 客户分页服务间请求。 */
export class CrmListUserRequestDto extends IntersectionType(
    PageDto,
    PartialType(PickType(Schema.TbCrmUserDto, ['name', 'status', 'currency', 'payMode', 'authStatus', 'source'] as const))
) {
    @ApiProperty({ description: '财务品牌主键', required: false, example: 1001 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: '财务品牌主键必须是整数' })
    @Min(1, { message: '财务品牌主键必须大于0' })
    brandKeyId?: number
}
