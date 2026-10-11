-- 客户别名规则：CSK + 创建人工号 + 4位数字或大写字母随机码，并增加唯一索引保证不可重复。
-- 测试库现有客户归属账号 2281665656346656771 的工号为 1233；以下固定随机码已预先去重，仅使用 123456789ABCDFGHKMNPQRSTUWXY。
-- 回滚：ALTER TABLE `tb_crm_user` DROP INDEX `uk_tb_crm_user_alias`, MODIFY COLUMN `alias` varchar(64) NULL COMMENT '客户别名';

UPDATE `tb_crm_user`
SET `alias` = CASE `key_id`
    WHEN 10241000 THEN 'CSK1233BTX7'
    WHEN 10241001 THEN 'CSK1233R7MP'
    WHEN 10241002 THEN 'CSK12331YA2'
    WHEN 10241003 THEN 'CSK1233FX3S'
    WHEN 10241004 THEN 'CSK12331DAK'
    WHEN 10241005 THEN 'CSK1233QW57'
    WHEN 10241006 THEN 'CSK1233C4NS'
    WHEN 10241007 THEN 'CSK1233BUQ3'
    ELSE `alias`
END
WHERE `key_id` BETWEEN 10241000 AND 10241007;

ALTER TABLE `tb_crm_user`
    MODIFY COLUMN `alias` varchar(64) NULL COMMENT '客户别名：CSK + 创建人工号 + 4位数字或大写字母随机码，全表唯一',
    ADD UNIQUE KEY `uk_tb_crm_user_alias` (`alias`);
