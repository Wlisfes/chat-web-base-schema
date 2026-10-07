-- 短信应用 ID 固定为 16 位字母数字；secret 存 AES-256-GCM 密文（约 129 字符），保持 varchar(255)。执行前须确认没有超过 16 位的 app_id。
-- 回滚：ALTER TABLE `tb_crm_sms_app` MODIFY COLUMN `app_id` varchar(32) NOT NULL COMMENT '应用ID';

ALTER TABLE `tb_crm_sms_app`
    MODIFY COLUMN `app_id` varchar(16) NOT NULL COMMENT '应用ID',
    MODIFY COLUMN `secret` varchar(255) NULL COMMENT '应用密钥（AES-256-GCM 加密存储）';