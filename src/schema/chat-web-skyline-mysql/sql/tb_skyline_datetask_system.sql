CREATE TABLE IF NOT EXISTS `tb_skyline_datetask_system` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `task_id` varchar(19) NOT NULL COMMENT '任务ID',
    `task_name` varchar(128) NOT NULL COMMENT '任务名称',
    `handler` varchar(64) NOT NULL COMMENT '处理器标识',
    `comment` varchar(256) NULL COMMENT '任务描述',
    `cron` varchar(32) NULL COMMENT 'Cron 表达式',
    `type` varchar(32) NOT NULL COMMENT '任务类型：cron=周期任务（按照 Cron 表达式周期执行的任务）；manual=手动任务（仅由人工操作触发的任务）；system=系统任务（系统内置且不可删除的任务）',
    `status` varchar(32) NOT NULL COMMENT '任务状态：stop=停止（任务已停止调度）；wait=等待运行（任务等待下一次调度）；running=运行中（任务已启用并参与调度）；finish=已完成（任务已执行完成）',
    `body` text NULL COMMENT '任务参数',
    `last_time` datetime(3) NULL COMMENT '上次执行时间',
    `next_time` datetime(3) NULL COMMENT '下次执行时间',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_skyline_datetask_system_task_name` (`task_name`),
    KEY `idx_tb_skyline_datetask_system_task_id` (`task_id`),
    KEY `idx_tb_skyline_datetask_system_status` (`status`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Skyline 系统定时任务表';
