CREATE TABLE IF NOT EXISTS `tb_skyline_user_chunk` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `chunk_id` int NOT NULL COMMENT 'Skyline 枚举主键',
    `link_id` varchar(64) NOT NULL COMMENT '关联业务记录主键',
    `link_name` varchar(64) NOT NULL COMMENT '枚举关联类型：tb_skyline_user.post=账号岗位（link_id 为账号UID，chunk_id 为 Skyline 枚举 CHUNK_SYSTEM_ACCOUNT_USER_POST 主键）；tb_skyline_user.level=账号职级（link_id 为账号UID，chunk_id 为 Skyline 枚举 CHUNK_SYSTEM_ACCOUNT_USER_LEVEL 主键）',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_skyline_user_chunk_link` (`link_name`, `link_id`, `chunk_id`),
    KEY `idx_tb_skyline_user_chunk_chunk` (`link_name`, `chunk_id`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '业务枚举关联表';
