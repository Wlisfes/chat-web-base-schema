-- 删除 CRM 短信应用、报价草稿、正式报价表：短信业务已迁移到 chat-web-sms-service，数据已完整复制到 `chat-web-sms` 库（tb_sms_app/tb_sms_quote_draft/tb_sms_quote，主键与密文保持一致）。
-- 回滚：按 chat-web-sms-mysql 建表语句在 CRM 库重建 tb_crm_sms_app/tb_crm_sms_quote_draft/tb_crm_sms_quote，并从 `chat-web-sms` 库对应表回填数据。

DROP TABLE IF EXISTS `tb_crm_sms_quote`;
DROP TABLE IF EXISTS `tb_crm_sms_quote_draft`;
DROP TABLE IF EXISTS `tb_crm_sms_app`;