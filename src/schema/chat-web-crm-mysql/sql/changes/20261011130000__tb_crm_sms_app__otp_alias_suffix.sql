-- 短信验证码应用别名后缀由 OTP 调整为 SOTP，与 MRKT、NTFY 保持4个字符；仅修改 type=otp 且以 OTP 结尾的旧别名。
-- 回滚：UPDATE `tb_crm_sms_app` SET `app_alias` = CONCAT(LEFT(`app_alias`, CHAR_LENGTH(`app_alias`) - 4), 'OTP') WHERE `type` = 'otp' AND `app_alias` REGEXP '^CSK[A-Za-z0-9]+[0-9]{4}SOTP$';

UPDATE `tb_crm_sms_app`
SET `app_alias` = CONCAT(LEFT(`app_alias`, CHAR_LENGTH(`app_alias`) - 3), 'SOTP')
WHERE `type` = 'otp' AND `app_alias` REGEXP '^CSK[A-Za-z0-9]+[0-9]{4}OTP$';

UPDATE `tb_crm_sms_quote`
SET `app_alias` = CONCAT(LEFT(`app_alias`, CHAR_LENGTH(`app_alias`) - 3), 'SOTP')
WHERE `app_alias` REGEXP '^CSK[A-Za-z0-9]+[0-9]{4}OTP$';

UPDATE `tb_crm_sms_quote_draft`
SET `app_alias` = CONCAT(LEFT(`app_alias`, CHAR_LENGTH(`app_alias`) - 3), 'SOTP')
WHERE `app_alias` REGEXP '^CSK[A-Za-z0-9]+[0-9]{4}OTP$';