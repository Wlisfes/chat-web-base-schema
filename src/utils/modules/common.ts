import { cloneDeep, concat, omit, pick } from 'lodash'
import { isNotEmpty, isEmpty, isArray, isEmail, isString, isObject, isBoolean } from 'class-validator'
import moment from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { EnumMetadataItem, StringEnum, StringEnumValue } from '@/types'
moment.extend(timezone)
moment.extend(utc)

export { moment, cloneDeep, concat, omit, pick, isNotEmpty, isEmpty, isArray, isEmail, isString, isObject, isBoolean }

/** 统一生成枚举元数据、选项列表、数量和字段说明。 */
export function defineEnumMetadata<const TEnum extends StringEnum>(
    enumObject: TEnum,
    title: string,
    metadata: Record<StringEnumValue<TEnum>, EnumMetadataItem>
) {
    const values = Object.values(enumObject) as StringEnumValue<TEnum>[]
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
