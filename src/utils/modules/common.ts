import { cloneDeep, concat, omit, pick } from 'lodash'
import { isNotEmpty, isEmpty, isArray, isEmail, isString, isObject, isBoolean } from 'class-validator'
import type { Omix, EnumMetadataItem, EnumOption, PrimitiveEnum, PrimitiveEnumValue } from '@/types'
import { v1, v3, v4, v5, v6, v7 } from 'uuid'
import type { PageResult } from './page'
import moment from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
moment.extend(timezone)
moment.extend(utc)
export { v1, v3, v4, v5, v6, v7, moment, cloneDeep, concat, omit, pick }
export { isNotEmpty, isEmpty, isArray, isEmail, isString, isObject, isBoolean }

/** 读取枚举业务值，过滤数字枚举的反向映射键。 */
function listEnumValues<TEnum extends PrimitiveEnum>(enumObject: TEnum) {
    return Object.keys(enumObject)
        .filter(key => Number.isNaN(Number(key)))
        .map(key => enumObject[key]) as PrimitiveEnumValue<TEnum>[]
}

/** 统一生成枚举元数据、选项列表、数量和字段说明；选项按 metadata 书写顺序输出，字段说明保持枚举定义顺序。 */
export function defineEnumMetadata<const TEnum extends PrimitiveEnum>(
    enumObject: TEnum,
    title: string,
    metadata: Record<PrimitiveEnumValue<TEnum>, EnumMetadataItem>
) {
    const values = listEnumValues(enumObject)
    /**按 metadata 的书写顺序排列选项，供前端下拉、阶段条等按业务顺序展示。*/
    const orderedValues = Object.keys(metadata)
        .map(key => values.find(value => String(value) === key))
        .filter((value): value is PrimitiveEnumValue<TEnum> => value !== undefined)
    const options: EnumOption<PrimitiveEnumValue<TEnum>>[] = orderedValues.map(value => ({ value, ...metadata[value] }))
    /**字段说明沿用枚举定义顺序，与已发布的建表 SQL 注释保持一致。*/
    const comment = `${title}：${values.map(value => `${value}=${metadata[value].label}（${metadata[value].description}）`).join('；')}`

    return {
        metadata,
        values,
        options,
        count: options.length,
        comment
    }
}

/**
 * 字段输出控制
 * @param alias 表别名
 * @param fields 表字段
 * @returns 表字段查询组合键
 */
export function fetchSelection(alias: string, fields: string[]) {
    return (fields ?? []).map(field => (isNotEmpty(alias) ? `${alias}.${field}` : field))
}

/**
 * 返回包装
 * @param data
 * @param options
 * @returns
 */
export function fetchResolver<T>(data: Partial<PageResult<T>>, options: Omix = {}) {
    return Object.assign(data, options)
}
