-- 短信类型 SOTP 的展示名称由“验证码”改为“OTP短信”，与实体枚举注释保持一致。
-- 回滚：ALTER TABLE `tb_srm_simbank_message` MODIFY COLUMN `type` varchar(32) NULL COMMENT '短信类型：MRKT=营销短信（用于营销推广内容）；NTFY=通知短信（用于业务通知内容）；SOTP=验证码（用于一次性验证码）';

ALTER TABLE `tb_srm_simbank_message`
    MODIFY COLUMN `type` varchar(32) NULL COMMENT '短信类型：MRKT=营销短信（用于营销推广内容）；NTFY=通知短信（用于业务通知内容）；SOTP=OTP短信（用于一次性验证码）';
