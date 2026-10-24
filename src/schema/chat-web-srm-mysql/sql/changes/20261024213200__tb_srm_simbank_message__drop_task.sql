-- 短信历史不再记录任务。上游没有任务主键和任务名称，删除 task_id、task_name 及任务时间索引。
-- 回滚：ALTER TABLE `tb_srm_simbank_message` ADD COLUMN `task_id` varchar(19) NULL COMMENT '任务ID：发送短信所属的任务主键' AFTER `status_message`, ADD COLUMN `task_name` varchar(128) NULL COMMENT '任务名称快照' AFTER `task_id`, ADD INDEX `idx_tb_srm_simbank_message_task_create_time` (`task_id`, `create_time`);

ALTER TABLE `tb_srm_simbank_message`
    DROP INDEX `idx_tb_srm_simbank_message_task_create_time`,
    DROP COLUMN `task_id`,
    DROP COLUMN `task_name`;
