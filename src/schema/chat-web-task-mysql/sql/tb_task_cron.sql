CREATE TABLE IF NOT EXISTS `tb_task_cron` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `task_id` varchar(19) NOT NULL COMMENT '任务ID',
    `task_name` varchar(128) NOT NULL COMMENT '任务名称',
    `module` varchar(32) NOT NULL COMMENT '任务所属模块：TASK_SYSTEM=系统（系统管理模块的任务）；TASK_FINANCE=财务（财务模块的任务，如汇率同步）；TASK_CRM=CRM（CRM 客户关系管理模块的任务）',
    `handler` varchar(64) NOT NULL COMMENT '处理器标识',
    `comment` varchar(256) NULL COMMENT '任务描述',
    `cron` varchar(32) NOT NULL COMMENT 'Cron 表达式',
    `status` varchar(32) NOT NULL COMMENT '任务状态：disable=停用（不参与调度，可手动触发）；enable=启用（按照 Cron 表达式参与调度）',
    `body` text NULL COMMENT '任务参数',
    `max_attempts` int NOT NULL DEFAULT 8 COMMENT '单次执行最大尝试次数（含首次）',
    `last_time` datetime(3) NULL COMMENT '上次执行时间',
    `next_time` datetime(3) NULL COMMENT '下次执行时间',
    `create_by` varchar(19) NOT NULL DEFAULT '0' COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL DEFAULT '0' COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_task_cron_task_id` (`task_id`),
    UNIQUE KEY `uk_tb_task_cron_task_name` (`task_name`),
    KEY `idx_tb_task_cron_module` (`module`),
    KEY `idx_tb_task_cron_status` (`status`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Task 周期任务表';
