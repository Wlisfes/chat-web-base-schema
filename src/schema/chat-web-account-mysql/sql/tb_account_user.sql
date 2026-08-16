CREATE TABLE IF NOT EXISTS `tb_account_user` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `uid` varchar(19) NOT NULL COMMENT 'UID',
    `number` varchar(32) NOT NULL COMMENT '工号',
    `phone` varchar(32) NOT NULL COMMENT '手机号',
    `email` varchar(128) NULL COMMENT '邮箱',
    `name` varchar(32) NOT NULL COMMENT '姓名',
    `avatar` varchar(255) NULL COMMENT '头像',
    `status` varchar(32) NOT NULL COMMENT '账号状态：disabled=禁用（账号不可登录）；enabled=启用（账号可以正常登录）',
    `employment_status` varchar(32) NOT NULL COMMENT '员工状态：employed=在职（员工当前处于在职状态）；resigned=离职（员工已经离职）',
    `password` varchar(255) NOT NULL COMMENT '密码哈希',
    `last_login_time` datetime(3) NULL COMMENT '最后登录时间',
    `employment_time` datetime(3) NOT NULL COMMENT '入职时间',
    `resignation_time` datetime(3) NULL COMMENT '离职时间',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_user_uid` (`uid`),
    UNIQUE KEY `uk_tb_account_user_number` (`number`),
    UNIQUE KEY `uk_tb_account_user_phone` (`phone`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '员工账号表';
