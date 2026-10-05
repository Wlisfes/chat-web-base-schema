-- 短信应用表改名为 tb_crm_sms_app，删除冗余的 owner_user_uid（归属账号统一从 tb_crm_user 获取），secret 改为 AES-256-GCM 密文存储并扩容到 255。
-- 报价表与草稿表的 application_key_id 改名为 app_key_id；正式报价新增 expired=已失效 状态；草稿改为物理删除并移除 status 列。
-- 执行前测试库三张表均无数据；如存在旧明文 secret，需在 CRM 侧重置应用密钥后才能被新版本解密。
-- 回滚：RENAME TABLE `tb_crm_sms_app` TO `tb_crm_sms_application`，恢复 owner_user_uid 列和 idx_tb_crm_sms_application_owner_user_uid 索引并回填，
--       secret 改回 varchar(128)，下列 RENAME COLUMN / RENAME INDEX 新旧名称对调，草稿表补回 status varchar(32) NOT NULL DEFAULT 'active' 及 idx_tb_crm_sms_quote_draft_status 索引，
--       并将 expired 状态数据改回 deleted。

RENAME TABLE `tb_crm_sms_application` TO `tb_crm_sms_app`;

ALTER TABLE `tb_crm_sms_app`
    DROP INDEX `idx_tb_crm_sms_application_owner_user_uid`,
    DROP COLUMN `owner_user_uid`,
    MODIFY COLUMN `secret` varchar(255) NULL COMMENT '应用密钥（AES-256-GCM 加密存储）',
    RENAME INDEX `uk_tb_crm_sms_application_app_id` TO `uk_tb_crm_sms_app_app_id`,
    RENAME INDEX `uk_tb_crm_sms_application_user_alias` TO `uk_tb_crm_sms_app_user_alias`,
    RENAME INDEX `idx_tb_crm_sms_application_user_key_id` TO `idx_tb_crm_sms_app_user_key_id`,
    RENAME INDEX `idx_tb_crm_sms_application_status` TO `idx_tb_crm_sms_app_status`;

ALTER TABLE `tb_crm_sms_quote`
    RENAME COLUMN `application_key_id` TO `app_key_id`,
    MODIFY COLUMN `status` varchar(32) NOT NULL COMMENT '短信报价状态：deleted=已作废（报价被手动作废或在生效前被替换）；effective=已生效（报价当前有效）；expired=已失效（报价已到失效时间）；pending=待生效（报价等待生效时间）';

ALTER TABLE `tb_crm_sms_quote_draft`
    RENAME COLUMN `application_key_id` TO `app_key_id`,
    DROP INDEX `idx_tb_crm_sms_quote_draft_status`,
    DROP COLUMN `status`;
