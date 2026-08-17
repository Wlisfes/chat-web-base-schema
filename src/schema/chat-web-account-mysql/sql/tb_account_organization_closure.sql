CREATE TABLE IF NOT EXISTS `tb_account_organization_closure` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `ancestor_uid` varchar(19) NOT NULL COMMENT '祖先组织UID',
    `descendant_uid` varchar(19) NOT NULL COMMENT '后代组织UID',
    `depth` int NOT NULL COMMENT '层级距离；节点自身为0',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_organization_closure_path` (`ancestor_uid`, `descendant_uid`),
    KEY `idx_tb_account_organization_closure_descendant_depth` (`descendant_uid`, `depth`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '组织层级闭包表';
