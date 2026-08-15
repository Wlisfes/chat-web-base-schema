import { Entity, Column } from 'typeorm'
import { DataBaseAdapter } from '@/utils'

@Entity({ name: 'tb_account_user', comment: '员工账号表' })
export class WindowsAccount extends DataBaseAdapter {
    @Column({ comment: 'UID', update: false, length: 19, nullable: false })
    uid: string

    @Column({ comment: '工号', length: 32, nullable: false })
    number: string

    @Column({ type: 'varchar', comment: '手机号', length: 32, nullable: false })
    phone: string

    @Column({ comment: '邮箱', length: 128, nullable: true })
    email: string

    @Column({ comment: '姓名', length: 32, nullable: false })
    name: string

    @Column({ comment: '头像', length: 255, nullable: true })
    avatar: string

    @Column({ type: 'varchar', length: 32, nullable: false, comment: '账号状态' })
    status: string

    @Column({ type: 'varchar', length: 255, comment: '密码哈希', select: false, nullable: false })
    password: string
}
