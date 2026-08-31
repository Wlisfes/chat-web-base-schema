import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

/**
 * 所有服务统一使用的分页请求参数。
 *
 * `page` 从 1 开始，`size` 表示每页数量。分页接口不得再使用
 * `pageSize` 作为同义字段，避免服务之间的请求契约分叉。
 */
export class PageDto {
    @ApiPropertyOptional({ description: '页码，从1开始', default: 1, minimum: 1, example: 1 })
    @Type(() => Number)
    @IsOptional()
    @IsInt({ message: '页码必须是整数' })
    @Min(1, { message: '页码不能小于1' })
    page: number = 1

    @ApiPropertyOptional({ description: '每页数量', default: 50, minimum: 1, maximum: 100, example: 50 })
    @Type(() => Number)
    @IsOptional()
    @IsInt({ message: '每页数量必须是整数' })
    @Min(1, { message: '每页数量不能小于1' })
    @Max(100, { message: '每页数量不能超过100' })
    size: number = 50
}

/**
 * @deprecated 请使用 `PageDto`。保留该名称是为了兼容已发布共享包的消费方，
 * 其字段和校验规则与 `PageDto` 完全一致。
 */
export class SizePageDto extends PageDto {}

export interface PageResult<TItem> {
    page: number
    size: number
    total: number
    list: TItem[]
}
