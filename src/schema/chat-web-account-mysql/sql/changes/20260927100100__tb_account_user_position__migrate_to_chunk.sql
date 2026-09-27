-- 账号职位关系（改名为岗位）迁移到 tb_account_chunk（link_name = tb_account_user.post），迁移后删除 tb_account_user_position。
-- 职位主键 position_key_id 与 Skyline 枚举主键一致，直接写入 chunk_id；INSERT IGNORE + 表存在判断保证可重复执行。
-- 回滚：按删除前的 sql/tb_account_user_position.sql 重建表，并从 tb_account_chunk 中 link_name = 'tb_account_user.post' 的数据回写。

SET @has_user_position = (
    SELECT COUNT(*) FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tb_account_user_position'
);

SET @migrate_user_position = IF(
    @has_user_position > 0,
    'INSERT IGNORE INTO `tb_account_chunk` (`chunk_id`, `link_id`, `link_name`, `create_time`, `modify_time`) SELECT `position_key_id`, `user_uid`, ''tb_account_user.post'', `create_time`, `modify_time` FROM `tb_account_user_position`',
    'DO 0'
);
PREPARE migrate_user_position FROM @migrate_user_position;
EXECUTE migrate_user_position;
DEALLOCATE PREPARE migrate_user_position;

DROP TABLE IF EXISTS `tb_account_user_position`;
