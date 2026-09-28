-- 任务执行日志补充触发方式与触发人：默认系统执行，触发人默认系统账号 0；手动触发时记录操作人。
-- 回滚：ALTER TABLE `tb_skyline_datetask_log` DROP COLUMN `trigger_type`, DROP COLUMN `create_by`, DROP COLUMN `modify_by`;

ALTER TABLE `tb_skyline_datetask_log`
    ADD COLUMN `trigger_type` varchar(32) NOT NULL DEFAULT 'system' COMMENT '触发方式：system=系统执行（按照 Cron 表达式由系统自动调度执行）；manual=手动执行（由管理员在管理端手动触发执行）' AFTER `status`,
    ADD COLUMN `create_by` varchar(19) NOT NULL DEFAULT '0' COMMENT '创建账号UID' AFTER `result`,
    ADD COLUMN `modify_by` varchar(19) NULL DEFAULT '0' COMMENT '更新账号UID' AFTER `create_by`;
