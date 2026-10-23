-- 通道短信类型不再单独定义，列注释与短信应用类型 TbSmsAppType 保持一致。取值不变。
-- 回滚：ALTER TABLE `tb_srm_channel` MODIFY COLUMN `type` varchar(32) NOT NULL COMMENT '通道类型：MRKT=营销短信（用于营销推广内容）；NTFY=通知短信（用于业务通知内容）；SOTP=验证码（用于一次性验证码）';

ALTER TABLE `tb_srm_channel`
    MODIFY COLUMN `type` varchar(32) NOT NULL COMMENT '短信应用类型：MRKT=营销短信（用于营销推广内容）；NTFY=通知短信（用于业务通知内容）；SOTP=验证码（用于一次性验证码）';
