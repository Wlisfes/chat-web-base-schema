CREATE TABLE IF NOT EXISTS `tb_srm_billing_outbox` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `event_id` varchar(64) NOT NULL COMMENT '计费事件ID：msgId + 触发节点',
    `msg_id` varchar(36) NOT NULL COMMENT '短信ID',
    `trigger` varchar(32) NOT NULL COMMENT '计费触发节点：submitted=提交设备（预付供应商：短信提交到设备即计费）；success=发送成功（后付供应商：设备发送成功才计费）',
    `payload` text NOT NULL COMMENT '计费事件内容 JSON',
    `status` varchar(32) NOT NULL DEFAULT 'pending' COMMENT '计费事件发布状态：pending=待发布（已随发送记录写入，等待发布到 MQ）；published=已发布（已发布到 MQ，由 Finance 落账）',
    `attempts` int NOT NULL DEFAULT 0 COMMENT '发布尝试次数',
    `last_error` varchar(512) NULL COMMENT '最近一次发布失败原因',
    `published_time` datetime(3) NULL COMMENT '发布到 MQ 的时间',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_billing_outbox_event_id` (`event_id`),
    KEY `idx_tb_srm_billing_outbox_status_create_time` (`status`, `create_time`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 供应商计费事件发件箱表';