-- 设备短信记录关联 SMS 提交的短信ID。Dispatch 重投同一条短信时按 msg_id 复用记录，避免重复插入。
-- 历史上行短信和旧数据没有短信ID，字段允许为空；MySQL 唯一索引允许多个 NULL。
-- 回滚：ALTER TABLE `tb_srm_simbank_message` DROP INDEX `uk_tb_srm_simbank_message_msg_id`, DROP COLUMN `msg_id`;

ALTER TABLE `tb_srm_simbank_message`
    ADD COLUMN `msg_id` varchar(36) NULL COMMENT '短信ID：SMS 提交时生成，同一条短信重投时保持不变' AFTER `key_id`,
    ADD UNIQUE KEY `uk_tb_srm_simbank_message_msg_id` (`msg_id`);
