-- Skyline 岗位枚举类型编码统一为 CHUNK_SYSTEM_ACCOUNT_USER_POST，同步 link_name 字段注释；重复执行不产生变化。
-- 回滚：将注释中的 CHUNK_SYSTEM_ACCOUNT_USER_POST 改回 CHUNK_ACCOUNT_POST 后重新 MODIFY COLUMN。

ALTER TABLE `tb_account_chunk`
    MODIFY COLUMN `link_name` varchar(64) NOT NULL COMMENT '枚举关联类型：tb_account_user.post=账号岗位（link_id 为账号UID，chunk_id 为 Skyline 枚举 CHUNK_SYSTEM_ACCOUNT_USER_POST 主键）';
