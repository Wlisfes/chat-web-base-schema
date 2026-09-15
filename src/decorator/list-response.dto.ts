import { type Type } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { PageResponseDataDto } from '@/decorator/api-response.dto'

/** 创建带有强类型 list 字段的 Swagger 响应 DTO。 */
export function ListResponseDto<TItem>(itemType: Type<TItem>, description = '数据列表') {
    class ListResponseDataDto {
        @ApiProperty({ description, type: () => [itemType] })
        list: TItem[]
    }

    return ListResponseDataDto
}

/** 创建带有分页字段和强类型 list 字段的 Swagger 响应 DTO。 */
export function PageListResponseDto<TItem>(itemType: Type<TItem>, description = '分页数据列表') {
    class PageListResponseDataDto extends PageResponseDataDto {
        @ApiProperty({ description, type: () => [itemType] })
        list: TItem[]
    }

    return PageListResponseDataDto
}
