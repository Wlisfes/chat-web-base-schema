import {
    Between,
    Brackets,
    DataSource,
    DeleteResult,
    EntityManager,
    Equal,
    ILike,
    In,
    IsNull,
    LessThan,
    LessThanOrEqual,
    Like,
    MoreThan,
    MoreThanOrEqual,
    Not,
    QueryRunner,
    Raw,
    Repository,
    SelectQueryBuilder,
    UpdateResult
} from 'typeorm'
import type { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, ObjectLiteral } from 'typeorm'
import { InjectDataSource, InjectEntityManager, InjectRepository, TypeOrmModule } from '@nestjs/typeorm'

/** 业务服务统一从本包转出 TypeORM / Nest TypeORM 常用符号，避免直接依赖 typeorm。 */
export {
    Between,
    Brackets,
    DataSource,
    DeleteResult,
    EntityManager,
    Equal,
    ILike,
    In,
    InjectDataSource,
    InjectEntityManager,
    InjectRepository,
    IsNull,
    LessThan,
    LessThanOrEqual,
    Like,
    MoreThan,
    MoreThanOrEqual,
    Not,
    QueryRunner,
    Raw,
    Repository,
    SelectQueryBuilder,
    TypeOrmModule,
    UpdateResult
}

export type { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, ObjectLiteral }
