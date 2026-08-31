/** 通用对象。 */
export type Omix<T = Record<string, any>> = T & Record<string, any>

/** 从枚举对象中提取所有枚举值的联合类型。 */
export type OmixEnumValues<T> = T[Exclude<keyof T, 'name' | 'value'>] extends { value: infer V } ? V : never

/** 枚举值对应的展示信息。 */
export interface EnumMetadataItem {
    label: string
    description: string
}

/** 仅包含字符串值的枚举对象。 */
export type StringEnum = Record<string, string>

/** 提取字符串枚举对象的值联合类型。 */
export type StringEnumValue<TEnum extends StringEnum> = TEnum[keyof TEnum]

/** 前后端统一 API 响应结构。 */
export interface ApiResponse<T = unknown> {
    data: T | null
    code: number
    message: string
    logId: string
    timestamp: string
}

/** 创建统一 API 响应时可覆盖的元数据。 */
export interface ApiResponseOptions {
    code?: number
    message?: string
    logId?: string
}
