-- 路由新增规则组：一行一个规则组，组内条件存 JSON（且），同一路由的多个规则组之间是或；短信满足任意一个启用的规则组才能进入路由。
-- 路由没有启用的规则组时不接收任何短信。已有路由需要补配规则组后才会参与选路。
-- 回滚：DROP TABLE IF EXISTS `tb_srm_route_rule`;

CREATE TABLE IF NOT EXISTS `tb_srm_route_rule` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `route_key_id` int NOT NULL COMMENT '路由ID：SRM 路由主键',
    `name` varchar(64) NOT NULL COMMENT '规则组名称',
    `conditions` text NOT NULL COMMENT '组内条件 JSON 数组：[{ field, operator, value: string[] }]，全部满足才算命中',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '规则组状态：disable=停用（规则组不参与匹配）；enable=启用（规则组参与匹配）',
    `remark` varchar(512) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    KEY `idx_tb_srm_route_rule_route_key_id` (`route_key_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1002001 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 路由规则组表';
