CREATE TABLE IF NOT EXISTS `tb_crm_user_contact` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_key_id` int NOT NULL COMMENT 'CRM 客户主键',
    `name` varchar(64) NOT NULL COMMENT '联系人名称',
    `items` text NOT NULL DEFAULT ('[]') COMMENT '联系方式列表，JSON 数组：[{ type: 联系方式类型枚举项主键, value: 联系方式内容 }]',
    `address` varchar(512) NULL COMMENT '地址',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '联系人状态：disable=无效（联系人已标记无效）；enable=有效（联系人正常可用）',
    `remark` varchar(1024) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    KEY `idx_tb_crm_user_contact_user_key_id` (`user_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'CRM 客户联系人表';
