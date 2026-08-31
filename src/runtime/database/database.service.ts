import { Injectable } from '@nestjs/common'
import { DataSource, ObjectLiteral, QueryRunner, Repository, SelectQueryBuilder } from 'typeorm'
import { fetchSelection } from '@/utils'

export interface DatabaseTransactionOptions {
    /** 是否开启事务，默认开启。 */
    where?: boolean
}

@Injectable()
export class DataBaseService {
    constructor(private readonly dataSource: DataSource) {}

    /**
     * 条件SQL组合
     * @param where 是否继续往下执行
     * @param handler 执行方法
     * @returns handler执行结果、where条件
     */
    public async brackets<TResult>(where: boolean, handler?: (where: boolean) => TResult | Promise<TResult>): Promise<boolean | TResult> {
        if (where && handler) {
            return await handler(where)
        }
        return where
    }

    /**
     * 字段查询输出组合
     * @param qb orm实例
     * @param keys 字段列表
     * @returns orm实例
     */
    public async selection<T extends ObjectLiteral>(
        qb: SelectQueryBuilder<T>,
        keys: Array<[string, Array<string>]>
    ): Promise<SelectQueryBuilder<T>> {
        const fields = new Set(keys.flatMap(([alias, names]) => fetchSelection(alias, names)))
        return qb.select([...fields])
    }

    /**
     * 自定义查询
     * @param model 表实体
     * @param callback 回调函数
     * @returns 回调函数执行结果
     */
    public async builder<T extends ObjectLiteral, TResult>(
        model: Repository<T>,
        callback: (qb: SelectQueryBuilder<T>) => TResult | Promise<TResult>
    ): Promise<TResult> {
        const qb = model.createQueryBuilder('t')
        return await callback(qb)
    }

    /**
     * typeorm事务
     * @param options 事务配置
     * @returns TypeORM QueryRunner 实例
     */
    public async transaction(options: DatabaseTransactionOptions = {}): Promise<QueryRunner> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        if (options.where ?? true) {
            await queryRunner.startTransaction()
        }
        return queryRunner
    }
}
