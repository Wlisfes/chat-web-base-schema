-- 通道已取消名称字段：短信历史的通道名称快照 channel_name 改为通道别名快照 channel_alias；新增通道负责人快照 channel_owner_user_uid，按发送时的负责人统计业绩。
-- 回滚：ALTER TABLE `tb_srm_simbank_message` DROP INDEX `idx_tb_srm_simbank_message_channel_owner_create_time`, DROP COLUMN `channel_owner_user_uid`, CHANGE COLUMN `channel_alias` `channel_name` varchar(64) NULL COMMENT '通道名称快照';

ALTER TABLE `tb_srm_simbank_message`
    CHANGE COLUMN `channel_name` `channel_alias` varchar(32) NULL COMMENT '通道别名快照',
    ADD COLUMN `channel_owner_user_uid` varchar(19) NULL COMMENT '通道负责人账号UID快照' AFTER `channel_alias`,
    ADD INDEX `idx_tb_srm_simbank_message_channel_owner_create_time` (`channel_owner_user_uid`, `create_time`);
