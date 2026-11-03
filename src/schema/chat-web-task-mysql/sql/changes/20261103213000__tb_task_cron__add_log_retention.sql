-- 周期任务增加运行日志最大保留时长，默认 7 天。只清理已结束的执行记录，进行中的记录不删除。
-- 回滚：ALTER TABLE `tb_task_cron` DROP COLUMN `log_retention`;

ALTER TABLE `tb_task_cron`
    ADD COLUMN `log_retention` varchar(32) NOT NULL DEFAULT '7d' COMMENT '运行日志最大保留时长：24h=24小时（只保留最近24小时内已结束的执行记录）；3d=3天（只保留最近3天内已结束的执行记录）；7d=7天（只保留最近7天内已结束的执行记录）；15d=15天（只保留最近15天内已结束的执行记录）；30d=30天（只保留最近30天内已结束的执行记录）；60d=60天（只保留最近60天内已结束的执行记录）；90d=90天（只保留最近90天内已结束的执行记录）' AFTER `max_attempts`;
