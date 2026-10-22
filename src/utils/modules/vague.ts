import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * 通用模糊搜索入参。
 *
 * 只作为查询请求 DTO 的组合字段使用，不进入 `DataBaseDto`，避免出现在完整表 DTO 和响应模型中。
 * 具体匹配哪些字段由各接口自行决定，并在接口的 Swagger 描述中说明。
 */
export class VagueDto {
    @ApiPropertyOptional({
        description: '模糊搜索关键词；具体匹配字段由接口说明决定',
        example: '8613'
    })
    @IsOptional()
    @IsString({ message: '模糊搜索关键词必须是字符串' })
    @MaxLength(64, { message: '模糊搜索关键词长度不能超过64位' })
    vague?: string
}

/** 读取并去除模糊搜索关键词首尾空白；空字符串返回 */
export function fetchVagueKeyword(input: Pick<VagueDto, 'vague'>): string {
    return (input.vague ?? "").trim() 
}

/** 读取模糊搜索关键词；用于手机号、SIM 等入库不带 + 号的字段时，同时去掉开头的 + 号。 */
export function fetchVagueNumberKeyword(input: Pick<VagueDto, 'vague'>): string  {
    return fetchVagueKeyword(input).replace(/^\+/, '') 
}
