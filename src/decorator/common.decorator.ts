import { type Type } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { EnumOptionDto, PageResponseDataDto } from '@/decorator/api-response.dto'
import { registerDecorator, ValidationOptions, buildMessage, ValidateBy, ValidationArguments } from 'class-validator'

/**自定义装饰器**/
export function IsCustomize(options: {
    validate(value: any, args: ValidationArguments): Promise<boolean> | boolean
    message(prefix: string, args?: ValidationArguments): string
}) {
    return ValidateBy({
        name: 'isCustomize',
        validator: {
            validate: options.validate,
            defaultMessage: buildMessage(options.message)
        }
    })
}

/**自定义时间格式验证**/
export function IsDateCustomize(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isDateCustomize',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const regex = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2}(\.\d{3})?)?$/
                    return typeof value === 'string' && regex.test(value)
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property}必须是有效的日期时间格式: YYYY-MM-DD HH:mm:ss 或 YYYY-MM-DD`
                }
            }
        })
    }
}

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

/** 枚举响应字段的说明和示例。 */
export interface EnumsResponseFieldOptions {
    description: string
    example?: EnumOptionDto[]
}

/** 创建多组枚举选项的 Swagger 响应 DTO。 */
export function EnumsResponseDto<const TFields extends Record<string, EnumsResponseFieldOptions>>(fields: TFields) {
    class EnumsResponseDataDto {}

    for (const [propertyName, field] of Object.entries(fields)) {
        ApiProperty({
            description: field.description,
            type: () => EnumOptionDto,
            isArray: true,
            ...(field.example === undefined ? {} : { example: field.example })
        })(EnumsResponseDataDto.prototype, propertyName)
    }

    return EnumsResponseDataDto as Type<{ [K in keyof TFields]: EnumOptionDto[] }>
}
