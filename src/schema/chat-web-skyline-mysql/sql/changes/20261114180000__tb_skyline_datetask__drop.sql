-- 删除已废弃的 Skyline 定时任务表。任务配置和执行记录已迁到 chat-web-task 的 tb_task_cron、tb_task_execution，运行时代码不再读写这两张表。
-- 回滚：按 20260902220000、20260902230000、20260928180000 重建 tb_skyline_datetask_system，按 20260925100000、20260928190000 重建 tb_skyline_datetask_log；历史执行日志未迁移，无法从 Task 库回填。

DROP TABLE IF EXISTS `tb_skyline_datetask_log`;
DROP TABLE IF EXISTS `tb_skyline_datetask_system`;