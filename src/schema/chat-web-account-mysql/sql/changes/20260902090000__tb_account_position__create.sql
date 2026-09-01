CREATE TABLE IF NOT EXISTS `tb_account_position` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `name` varchar(64) NOT NULL COMMENT '职位名称',
    `sort` int NOT NULL DEFAULT 0 COMMENT '同级排序值',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_position_name` (`name`),
    KEY `idx_tb_account_position_sort` (`sort`, `key_id`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '员工职位表';
