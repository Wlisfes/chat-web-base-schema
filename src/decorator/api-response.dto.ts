import { ApiProperty } from '@nestjs/swagger'
import type { EnumChunkType } from '@/types'

/** Swagger 与 Apifox 展示使用的统一响应外壳。 */
export class ApiResponseDocumentDto {
    @ApiProperty({ description: '业务状态码', example: 200 })
    code: number

    @ApiProperty({ description: '响应消息', example: 'success' })
    message: string

    @ApiProperty({ description: '请求日志 ID，用于关联前端报错与服务日志', example: '34ec4ca9-2abf-49b8-85f6-77d7fd23ea1d' })
    logId: string

    @ApiProperty({ description: '服务端响应时间', example: '2026-08-23 12:00:00' })
    timestamp: string

    @ApiProperty({ description: '业务响应数据', nullable: true, example: null })
    data: unknown
}

/** 成功标记响应数据。 */
export class SuccessResponseDataDto {
    @ApiProperty({ description: '操作是否成功', example: true })
    success: boolean
}

/** 数据变更数量响应数据。 */
export class AffectedResponseDataDto {
    @ApiProperty({ description: '受影响的数据行数', example: 1 })
    affected: number
}

/** 通用分页响应字段。 */
export class PageResponseDataDto {
    @ApiProperty({ description: '当前页码', example: 1 })
    page: number

    @ApiProperty({ description: '每页数量', example: 50 })
    size: number

    @ApiProperty({ description: '数据总数', example: 128 })
    total: number
}

/** 前后端下拉统一使用的枚举选项。 */
export class EnumOptionDto {
    @ApiProperty({
        description: '枚举值',
        oneOf: [
            { type: 'string', example: 'menu' },
            { type: 'number', example: 1 }
        ],
        example: 'menu'
    })
    value: string | number

    @ApiProperty({ description: '枚举展示名称', example: '菜单' })
    label: string

    @ApiProperty({ description: '枚举说明', example: '可导航到页面的菜单节点' })
    description: string

    @ApiProperty({
        description: '枚举标签颜色类型，取值与管理端 common-base-chunk 组件一致',
        example: 'blue'
    })
    type: EnumChunkType
}
