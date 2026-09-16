import { cloneDeep, concat, omit, pick } from 'lodash'
import { isNotEmpty, isEmpty, isArray, isEmail, isString, isObject, isBoolean } from 'class-validator'
import type { PageResult } from './page'
import moment from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { Omix, EnumMetadataItem, PrimitiveEnum, PrimitiveEnumValue } from '@/types'
moment.extend(timezone)
moment.extend(utc)

export { moment, cloneDeep, concat, omit, pick, isNotEmpty, isEmpty, isArray, isEmail, isString, isObject, isBoolean }

/** 读取枚举业务值，过滤数字枚举的反向映射键。 */
function listEnumValues<TEnum extends PrimitiveEnum>(enumObject: TEnum) {
    return Object.keys(enumObject)
        .filter(key => Number.isNaN(Number(key)))
        .map(key => enumObject[key]) as PrimitiveEnumValue<TEnum>[]
}

/** 统一生成枚举元数据、选项列表、数量和字段说明。 */
export function defineEnumMetadata<const TEnum extends PrimitiveEnum>(
    enumObject: TEnum,
    title: string,
    metadata: Record<PrimitiveEnumValue<TEnum>, EnumMetadataItem>
) {
    const values = listEnumValues(enumObject)
    const options = values.map(value => ({ value, ...metadata[value] }))
    const comment = `${title}：${options.map(option => `${option.value}=${option.label}（${option.description}）`).join('；')}`

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
