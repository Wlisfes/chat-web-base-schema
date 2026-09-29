-- 客户表 tb_crm_consumer 重命名为 tb_crm_user，同步重命名索引；
-- 注册来源 source 从字符串枚举（manual/platform）改为存储 Skyline 枚举 CHUNK_CRM_CRM_USER_SOURCE 的枚举项主键：
--   manual=1024186（手动创建）、platform=1024187（平台注册），其他未知值回填为手动创建。
-- 回滚：ALTER TABLE `tb_crm_user` MODIFY COLUMN `source` varchar(32) NOT NULL DEFAULT 'manual' COMMENT '注册来源：manual=手动创建（管理端人工创建）；platform=平台注册（客户从平台注册）'；
--       UPDATE `tb_crm_user` SET `source` = CASE `source` WHEN '1024187' THEN 'platform' ELSE 'manual' END；
--       再将表名与索引名改回 tb_crm_consumer / uk_tb_crm_consumer_* / idx_tb_crm_consumer_*。

RENAME TABLE `tb_crm_consumer` TO `tb_crm_user`;

ALTER TABLE `tb_crm_user`
    RENAME INDEX `uk_tb_crm_consumer_uid` TO `uk_tb_crm_user_uid`,
    RENAME INDEX `idx_tb_crm_consumer_owner_user_uid` TO `idx_tb_crm_user_owner_user_uid`,
    RENAME INDEX `idx_tb_crm_consumer_brand_key_id` TO `idx_tb_crm_user_brand_key_id`,
    RENAME INDEX `idx_tb_crm_consumer_status` TO `idx_tb_crm_user_status`,
    RENAME INDEX `idx_tb_crm_consumer_currency` TO `idx_tb_crm_user_currency`;

ALTER TABLE `tb_crm_user`
    MODIFY COLUMN `source` varchar(32) NOT NULL COMMENT '注册来源';

UPDATE `tb_crm_user`
SET `source` = CASE `source` WHEN 'platform' THEN '1024187' WHEN '1024187' THEN '1024187' ELSE '1024186' END;

ALTER TABLE `tb_crm_user`
    MODIFY COLUMN `source` int NOT NULL COMMENT '注册来源：Skyline 枚举 CHUNK_CRM_CRM_USER_SOURCE 的枚举项主键';
