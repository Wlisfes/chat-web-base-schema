-- 客户表不再单独维护客户UID，统一使用主键 key_id 作为客户标识，关联子表只存 user_key_id；
-- 主键自增起始值调整为 10241000（当前测试库无客户数据，无需迁移子表关联值）。
-- 回滚：ALTER TABLE `tb_crm_user` ADD COLUMN `uid` varchar(19) NOT NULL COMMENT '客户UID' AFTER `key_id`, ADD UNIQUE KEY `uk_tb_crm_user_uid` (`uid`);

ALTER TABLE `tb_crm_user`
    DROP INDEX `uk_tb_crm_user_uid`,
    DROP COLUMN `uid`;

ALTER TABLE `tb_crm_user` AUTO_INCREMENT = 10241000;
