CREATE TABLE IF NOT EXISTS `tb_skyline_logger` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `log_id` varchar(64) NOT NULL COMMENT '请求日志号，与访问日志 x-request-id 对应',
    `service_name` varchar(64) NOT NULL COMMENT '产生操作的服务名',
    `permission_code` varchar(128) NOT NULL COMMENT '操作权限码，与菜单按钮 permission_code 一致',
    `sheet_key_id` int NULL COMMENT '写入时解析到的菜单节点主键；菜单删除后仍保留',
    `sheet_name` varchar(64) NULL COMMENT '写入时的菜单名称快照',
    `resource_type` varchar(64) NULL COMMENT '业务对象类型',
    `resource_id` varchar(64) NULL COMMENT '业务对象主键或业务编号',
    `operator_uid` varchar(19) NULL COMMENT '操作人账号UID',
    `operator_number` varchar(32) NULL COMMENT '操作人工号',
    `operator_name` varchar(64) NULL COMMENT '操作人姓名',
    `method` varchar(16) NOT NULL COMMENT 'HTTP 方法',
    `url` varchar(512) NOT NULL COMMENT '请求路径',
    `ip` varchar(64) NULL COMMENT '客户端 IP',
    `result` varchar(32) NOT NULL COMMENT '操作结果：success=成功；failure=失败',
    `message` varchar(255) NULL COMMENT '失败原因或结果说明',
    `request_body` text NULL COMMENT '脱敏并截断后的请求体',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    KEY `idx_tb_skyline_logger_permission_time` (`permission_code`, `create_time`),
    KEY `idx_tb_skyline_logger_sheet_time` (`sheet_key_id`, `create_time`),
    KEY `idx_tb_skyline_logger_operator_time` (`operator_uid`, `create_time`),
    KEY `idx_tb_skyline_logger_resource` (`resource_type`, `resource_id`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '系统日志表';
