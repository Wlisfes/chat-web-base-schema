-- 职位主数据已迁移为 Skyline 系统枚举 CHUNK_ACCOUNT_POSITION（chat-web-skyline.tb_skyline_chunk），
-- Account 不再读写 tb_account_position，删除残留表。tb_account_user_position.position_key_id 存储职位枚举 value。
-- 回滚：按删除前的 sql/tb_account_position.sql 重建表结构；历史职位数据以 Skyline 枚举为准，不再回写。

DROP TABLE IF EXISTS `tb_account_position`;
