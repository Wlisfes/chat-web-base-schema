-- 新增枚举关联类型 tb_account_user.level（账号职级），同步 link_name 字段注释；重复执行不产生变化。
-- 回滚：DELETE FROM `tb_account_chunk` WHERE `link_name` = 'tb_account_user.level'；注释恢复为仅包含 tb_account_user.post 后重新 MODIFY COLUMN。

ALTER TABLE `tb_account_chunk`
    MODIFY COLUMN `link_name` varchar(64) NOT NULL COMMENT '枚举关联类型：tb_account_user.post=账号岗位（link_id 为账号UID，chunk_id 为 Skyline 枚举 CHUNK_SYSTEM_ACCOUNT_USER_POST 主键）；tb_account_user.level=账号职级（link_id 为账号UID，chunk_id 为 Skyline 枚举 CHUNK_SYSTEM_ACCOUNT_USER_LEVEL 主键）';
