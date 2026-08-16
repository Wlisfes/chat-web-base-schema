import { PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, Column, ColumnOptions } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { isEmpty, moment } from '@/utils/modules/common'

/**时间格式装饰器**/
export function DateWithColumn(
    Decorator: (options: ColumnOptions) => PropertyDecorator,
    data: ColumnOptions & { format?: string }
): PropertyDecorator {
    const { format = 'YYYY-MM-DD HH:mm:ss', ...options } = data

    return Decorator({
        ...options,
        transformer: {
            to: (value: unknown) => value,
            from: (value: unknown) => (isEmpty(value) ? null : moment(value as string | number | Date).format(format))
        }
    })
}

/** JSON 字段装饰器。 */
export function WithJsonColumn<TValue = Record<string, unknown>>(data: ColumnOptions): PropertyDecorator {
    return Column({
        ...data,
        type: 'text',
        transformer: {
            from: (value: string | null | undefined): TValue | null => (value ? (JSON.parse(value) as TValue) : null),
            to: (value: TValue | null | undefined): string | null => (value == null ? null : JSON.stringify(value))
        }
    })
}

/**基础表字段继承**/
export abstract class DataBaseAdapter {
    @PrimaryGeneratedColumn({ type: 'int', name: 'key_id', comment: '表主键' })
    keyId: number

    @DateWithColumn(CreateDateColumn, { type: 'datetime', precision: 3, name: 'create_time', comment: '创建时间', update: false })
    createTime: Date

    @DateWithColumn(UpdateDateColumn, { type: 'datetime', precision: 3, name: 'modify_time', comment: '更新时间' })
    modifyTime: Date
}

/** 基础表的完整只读字段 DTO。 */
export abstract class DataBaseDto {
    @ApiProperty({ description: '表主键', example: 1, readOnly: true })
    keyId: number

    @ApiProperty({ description: '创建时间', example: '2026-08-16 12:00:00.000', readOnly: true })
    createTime: Date

    @ApiProperty({ description: '修改时间', example: '2026-08-16 12:00:00.000', readOnly: true })
    modifyTime: Date
}

/**创建人关联表字段继承**/
export abstract class DataBaseByAdapter extends DataBaseAdapter {
    @Column({ name: 'create_by', type: 'varchar', comment: '创建账号UID', length: 19, update: false, nullable: false })
    createBy: string

    @Column({ name: 'modify_by', type: 'varchar', comment: '更新账号UID', length: 19, nullable: true })
    modifyBy: string
}

/** 带操作人审计字段的完整只读 DTO。 */
export abstract class DataBaseByDto extends DataBaseDto {
    @ApiProperty({ description: '创建账号UID', example: '2149446185344106496', readOnly: true })
    createBy: string

    @ApiProperty({ description: '更新账号UID', example: '2149446185344106496', required: false, readOnly: true })
    modifyBy: string
}
