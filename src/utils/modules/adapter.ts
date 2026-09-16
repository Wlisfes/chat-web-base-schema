import { PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, Column, ColumnOptions } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator'
import { isEmpty, moment } from '@/utils/modules/common'
import { IsDateCustomize } from '@/decorator/common.decorator'

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

/**基础表字段名**/
export enum DataBaseColumn {
    KEY_ID = 'key_id',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by'
}

/**基础表字段继承**/
export abstract class DataBaseAdapter {
    @PrimaryGeneratedColumn({ type: 'int', name: DataBaseColumn.KEY_ID, comment: '表主键' })
    keyId: number

    @DateWithColumn(CreateDateColumn, {
        type: 'datetime',
        precision: 3,
        name: DataBaseColumn.CREATE_TIME,
        comment: '创建时间',
        update: false
    })
    createTime: Date

    @DateWithColumn(UpdateDateColumn, {
        type: 'datetime',
        precision: 3,
        name: DataBaseColumn.MODIFY_TIME,
        comment: '更新时间'
    })
    modifyTime: Date
}

/** 基础表的完整字段 DTO。 */
export abstract class DataBaseDto {
    @ApiProperty({ description: '表主键', example: 1 })
    @Type(() => Number)
    @IsNotEmpty({ message: '表主键不能为空' })
    @IsInt({ message: '表主键必须是整数' })
    @Min(1, { message: '表主键必须大于0' })
    keyId: number

    @ApiProperty({ description: '创建时间', example: '2026-08-16 12:00:00', readOnly: true })
    @IsOptional()
    @IsDateCustomize({ message: '创建时间格式错误' })
    createTime: Date

    @ApiProperty({ description: '修改时间', example: '2026-08-16 23:59:59', readOnly: true })
    @IsOptional()
    @IsDateCustomize({ message: '修改时间格式错误' })
    modifyTime: Date
}

/**创建人关联表字段继承**/
export abstract class DataBaseByAdapter extends DataBaseAdapter {
    @Column({ name: DataBaseColumn.CREATE_BY, type: 'varchar', comment: '创建账号UID', length: 19, update: false, nullable: false })
    createBy: string

    @Column({ name: DataBaseColumn.MODIFY_BY, type: 'varchar', comment: '更新账号UID', length: 19, nullable: true })
    modifyBy: string
}

/** 带操作人审计字段的完整只读 DTO。 */
export abstract class DataBaseByDto extends DataBaseDto {
    @ApiProperty({ description: '创建账号UID', example: '2149446185344106496', readOnly: true })
    @IsNotEmpty({ message: '创建账号UID必填' })
    createBy: string

    @ApiProperty({ description: '更新账号UID', example: '2149446185344106496', required: false, readOnly: true })
    @IsNotEmpty({ message: '更新账号UID必填' })
    modifyBy: string
}
