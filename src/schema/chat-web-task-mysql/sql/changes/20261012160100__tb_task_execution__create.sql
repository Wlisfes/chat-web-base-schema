-- 新建 Task 任务执行记录表：每次触发一条记录，承载幂等业务键、投递状态、重试次数和执行结果摘要，不保存业务明细。
-- 回滚：DROP TABLE IF EXISTS `tb_task_execution`;

CREATE TABLE IF NOT EXISTS `tb_task_execution` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `execution_id` varchar(19) NOT NULL COMMENT '执行记录ID',
    `task_id` varchar(19) NOT NULL COMMENT '任务ID',
    `task_name` varchar(128) NOT NULL COMMENT '任务名称',
    `handler` varchar(64) NOT NULL COMMENT '处理器标识',
    `biz_key` varchar(128) NOT NULL COMMENT '业务幂等键',
    `trigger_type` varchar(32) NOT NULL COMMENT '触发方式：system=系统执行（按照 Cron 表达式由系统自动调度执行）；manual=手动执行（由管理员在管理端手动触发执行）',
    `status` varchar(32) NOT NULL COMMENT '执行状态：pending=待执行（已生成执行记录，等待投递或消费）；running=执行中（执行器正在处理）；retrying=等待重试（上次尝试失败，等待下次重试）；success=执行成功（任务执行成功）；failed=执行失败（超过最大尝试次数或遇到不可重试错误）',
    `body` text NULL COMMENT '任务参数',
    `attempts` int NOT NULL DEFAULT 0 COMMENT '已尝试次数',
    `max_attempts` int NOT NULL COMMENT '最大尝试次数（含首次）',
    `scheduled_time` datetime(3) NOT NULL COMMENT '计划执行时间',
    `publish_time` datetime(3) NULL COMMENT '最近投递时间',
    `next_retry_time` datetime(3) NULL COMMENT '下次重试时间',
    `start_time` datetime(3) NULL COMMENT '首次开始执行时间',
    `end_time` datetime(3) NULL COMMENT '最终结束时间',
    `duration` int NOT NULL DEFAULT 0 COMMENT '最后一次尝试耗时（毫秒）',
    `result` text NULL COMMENT '执行结果摘要',
    `error` varchar(1024) NULL COMMENT '最后一次失败原因',
    `create_by` varchar(19) NOT NULL DEFAULT '0' COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL DEFAULT '0' COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_task_execution_execution_id` (`execution_id`),
    UNIQUE KEY `uk_tb_task_execution_biz_key` (`biz_key`),
    KEY `idx_tb_task_execution_task_id_scheduled_time` (`task_id`, `scheduled_time`),
    KEY `idx_tb_task_execution_status_next_retry_time` (`status`, `next_retry_time`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Task 任务执行记录表';
