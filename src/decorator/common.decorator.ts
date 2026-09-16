import { type Type } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { PageResponseDataDto } from '@/decorator/api-response.dto'
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
