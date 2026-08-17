CREATE TABLE IF NOT EXISTS `tb_account_organization` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `uid` varchar(19) NOT NULL COMMENT '组织UID',
    `parent_uid` varchar(19) NULL COMMENT '父组织UID',
    `code` varchar(64) NOT NULL COMMENT '组织编码',
    `name` varchar(64) NOT NULL COMMENT '组织名称',
    `type` varchar(32) NOT NULL COMMENT '组织类型：company=公司（组织架构的公司或法人主体节点）；department=部门（正式部门节点）；team=团队（项目组等非正式团队节点）',
    `leader_user_uid` varchar(19) NULL COMMENT '负责人账号UID',
    `sort` int NOT NULL DEFAULT 0 COMMENT '同级排序值',
    `status` varchar(32) NOT NULL COMMENT '组织状态：disabled=禁用（组织节点不可再用于新增授权或成员关系）；enabled=启用（组织节点正常使用）',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_organization_uid` (`uid`),
    UNIQUE KEY `uk_tb_account_organization_code` (`code`),
    KEY `idx_tb_account_organization_parent_sort` (`parent_uid`, `sort`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '组织架构表';
