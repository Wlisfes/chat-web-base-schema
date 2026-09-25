CREATE TABLE IF NOT EXISTS `tb_skyline_datetask_log` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `execution_id` varchar(64) NOT NULL COMMENT '执行记录ID',
    `task_id` varchar(19) NOT NULL COMMENT '任务ID',
    `task_name` varchar(128) NULL COMMENT '任务名称',
    `status` varchar(32) NOT NULL COMMENT '执行状态：running=执行中（任务正在执行）；success=执行成功（任务执行成功）；failed=执行失败（任务执行失败）',
    `duration` int NOT NULL DEFAULT 0 COMMENT '执行耗时（毫秒）',
    `start_time` datetime(3) NOT NULL COMMENT '开始时间',
    `end_time` datetime(3) NULL COMMENT '结束时间',
    `result` text NULL COMMENT '执行结果',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_skyline_datetask_log_execution_id` (`execution_id`),
    KEY `idx_tb_skyline_datetask_log_task_id_start_time` (`task_id`, `start_time`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Skyline 定时任务执行日志表';
