-- 客户表改名为 tb_crm_user 后，关联表的客户字段同步改名：consumer_key_id -> user_key_id，consumer_alias -> user_alias；索引名同步调整。
-- 仅改名，不修改字段类型与数据。
-- 回滚：将下列 RENAME COLUMN / RENAME INDEX 的新旧名称对调后执行。

ALTER TABLE `tb_crm_sms_application`
    RENAME COLUMN `consumer_key_id` TO `user_key_id`,
    RENAME INDEX `uk_tb_crm_sms_application_consumer_alias` TO `uk_tb_crm_sms_application_user_alias`,
    RENAME INDEX `idx_tb_crm_sms_application_consumer_key_id` TO `idx_tb_crm_sms_application_user_key_id`;

ALTER TABLE `tb_crm_sms_quote_draft`
    RENAME COLUMN `consumer_key_id` TO `user_key_id`,
    RENAME COLUMN `consumer_alias` TO `user_alias`,
    RENAME INDEX `idx_tb_crm_sms_quote_draft_consumer_app` TO `idx_tb_crm_sms_quote_draft_user_app`;

ALTER TABLE `tb_crm_sms_quote`
    RENAME COLUMN `consumer_key_id` TO `user_key_id`,
    RENAME COLUMN `consumer_alias` TO `user_alias`,
    RENAME INDEX `idx_tb_crm_sms_quote_consumer_app` TO `idx_tb_crm_sms_quote_user_app`;
