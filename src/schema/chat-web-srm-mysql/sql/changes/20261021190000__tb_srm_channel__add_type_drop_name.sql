-- 通道新增短信类型 type（取值与短信应用类型一致），通道只承载同类型短信；删除通道名称 name，统一以别名 alias 展示。
-- 回滚：ALTER TABLE `tb_srm_channel` DROP INDEX `idx_tb_srm_channel_type`, DROP COLUMN `type`, ADD COLUMN `name` varchar(64) NOT NULL DEFAULT '' COMMENT '通道名称' AFTER `key_id`;

ALTER TABLE `tb_srm_channel`
    DROP COLUMN `name`,
    ADD COLUMN `type` varchar(32) NOT NULL COMMENT '通道类型：MRKT=营销短信（用于营销推广内容）；NTFY=通知短信（用于业务通知内容）；SOTP=验证码（用于一次性验证码）' AFTER `alias`,
    ADD INDEX `idx_tb_srm_channel_type` (`type`);