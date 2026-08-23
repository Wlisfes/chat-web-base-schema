import { ApiProperty } from '@nestjs/swagger'

/** Swagger 与 Apifox 展示使用的统一响应外壳。 */
export class ApiResponseDocumentDto {
    @ApiProperty({ description: '业务状态码', example: 200 })
    code: number

    @ApiProperty({ description: '响应消息', example: 'success' })
    message: string

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

    @ApiProperty({ description: '每页数量', example: 20 })
    pageSize: number

    @ApiProperty({ description: '数据总数', example: 128 })
    total: number
}
