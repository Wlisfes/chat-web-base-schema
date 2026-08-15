import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { accountMysqlEntities } from './entities';

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export default new DataSource({
  type: 'mysql',
  host: process.env.ACCOUNT_DB_HOST ?? '127.0.0.1',
  port: Number(process.env.ACCOUNT_DB_PORT ?? 3306),
  username: requiredEnv('ACCOUNT_DB_USERNAME'),
  password: requiredEnv('ACCOUNT_DB_PASSWORD'),
  database: requiredEnv('ACCOUNT_DB_DATABASE'),
  charset: 'utf8mb4',
  timezone: 'Z',
  entities: [...accountMysqlEntities],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
  synchronize: false,
});
