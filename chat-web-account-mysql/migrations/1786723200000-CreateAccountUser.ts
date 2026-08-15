import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountUser1786723200000 implements MigrationInterface {
  name = 'CreateAccountUser1786723200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`account_user\` (
        \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
        \`username\` varchar(64) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`nickname\` varchar(64) NULL,
        \`status\` tinyint unsigned NOT NULL DEFAULT 1,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE INDEX \`uk_account_user_username\` (\`username\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `account_user`');
  }
}
