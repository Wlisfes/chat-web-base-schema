CREATE TABLE IF NOT EXISTS `tb_srm_route` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `name` varchar(64) NOT NULL COMMENT '路由名称',
    `alias` varchar(64) NULL COMMENT '路由别名：创建时按 SK + 归属人工号 + 路由类型 + 分段序号自动生成，全表唯一，创建后不可修改',
    `type` varchar(32) NOT NULL COMMENT '路由类型：MRKT=营销路由（用于营销推广内容）；NTFY=通知路由（用于业务通知内容）；SOTP=OTP路由（用于一次性验证码）',
    `priority` int NOT NULL DEFAULT 1 COMMENT '优先级：同类型路由按优先级从小到大依次尝试，1 最优先，最大 100',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由状态：disable=停用（路由不参与选路，绑定该路由的短信应用回落到同类型路由）；enable=启用（路由参与选路）',
    `owner_user_uid` varchar(19) NOT NULL COMMENT '归属人账号UID',
    `remark` varchar(512) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_route_alias` (`alias`),
    KEY `idx_tb_srm_route_type_priority` (`type`, `priority`),
    KEY `idx_tb_srm_route_status` (`status`),
    KEY `idx_tb_srm_route_owner_user_uid` (`owner_user_uid`)
) ENGINE = InnoDB AUTO_INCREMENT = 1002001 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 短信路由表';