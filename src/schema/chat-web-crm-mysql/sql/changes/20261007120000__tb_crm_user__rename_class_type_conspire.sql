-- 客户类型枚举值 cooperate 更名为 conspire（推广客户），同步历史数据与字段注释；重复执行不产生变化。
-- 回滚：UPDATE `tb_crm_user` SET `class_type` = 'cooperate' WHERE `class_type` = 'conspire'; 并恢复字段注释。

UPDATE `tb_crm_user`
SET `class_type` = 'conspire'
WHERE `class_type` = 'cooperate';

ALTER TABLE `tb_crm_user`
    MODIFY COLUMN `class_type` varchar(32) NOT NULL DEFAULT 'common' COMMENT '客户类型：common=普通客户（普通业务客户）；conspire=推广客户（合作推广客户）';
