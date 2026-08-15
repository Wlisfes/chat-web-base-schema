import { PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, Column, ColumnOptions } from 'typeorm'
import { isEmpty } from 'class-validator'
import dayjs from 'dayjs'

/**时间格式装饰器**/
export function DateWithColumn(
    Decorator: (options: ColumnOptions) => PropertyDecorator,
    data: ColumnOptions & { format?: string }
): PropertyDecorator {
    return Decorator({
        ...data,
        transformer: {
            to: (s: any) => s,
            from: (s: any) => (isEmpty(s) ? null : dayjs(s).format(data.format ?? 'YYYY-MM-DD HH:mm:ss'))
        }
    })
}

/**json自定自定义装饰器**/
export function WithJsonColumn(data: ColumnOptions): PropertyDecorator {
    return Column({
        ...data,
        type: 'text',
        transformer: {
            from: (s: string) => JSON.parse(s ?? '{}'),
            to: (s: Record<string, unknown> | null) => (s ? JSON.stringify(s) : null)
        }
    })
}

/**基础表字段继承**/
export abstract class DataBaseAdapter {
    @PrimaryGeneratedColumn({ type: 'int', name: 'key_id', comment: '表主键' })
    keyId: number

    @DateWithColumn(CreateDateColumn, { name: 'create_time', comment: '创建时间', update: false })
    createTime: Date

    @DateWithColumn(UpdateDateColumn, { name: 'modify_time', comment: '更新时间' })
    modifyTime: Date
}

/**创建人关联表字段继承**/
export abstract class DataBaseByAdapter extends DataBaseAdapter {
    @Column({ name: 'create_by', comment: '创建账号UID', length: 19, update: false, nullable: false })
    createBy: string

    @Column({ name: 'modify_by', comment: '更新账号UID', length: 19, nullable: true })
    modifyBy: string
}
