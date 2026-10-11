-- 短信应用类型枚举值与应用别名中的4位类型标识保持一致：market -> MRKT，notify -> NTFY，otp -> SOTP。
-- 回滚：UPDATE `tb_crm_sms_app` SET `type` = CASE `type` WHEN 'MRKT' THEN 'market' WHEN 'NTFY' THEN 'notify' WHEN 'SOTP' THEN 'otp' ELSE `type` END WHERE `type` IN ('MRKT', 'NTFY', 'SOTP');
-- 回滚后同步恢复字段注释为：短信应用类型：market=营销短信（用于营销推广内容）；notify=通知短信（用于业务通知内容）；otp=验证码（用于一次性验证码）

UPDATE `tb_crm_sms_app`
SET `type` = CASE `type` WHEN 'market' THEN 'MRKT' WHEN 'notify' THEN 'NTFY' WHEN 'otp' THEN 'SOTP' ELSE `type` END
WHERE `type` IN ('market', 'notify', 'otp');

ALTER TABLE `tb_crm_sms_app`
    MODIFY COLUMN `type` varchar(32) NOT NULL COMMENT '短信应用类型：MRKT=营销短信（用于营销推广内容）；NTFY=通知短信（用于业务通知内容）；SOTP=验证码（用于一次性验证码）';
