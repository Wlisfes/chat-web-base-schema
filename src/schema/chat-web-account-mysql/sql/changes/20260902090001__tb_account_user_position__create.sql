CREATE TABLE IF NOT EXISTS `tb_account_user_position` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_uid` varchar(19) NOT NULL COMMENT '账号UID',
    `position_key_id` int NOT NULL COMMENT '职位主键',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_user_position_assignment` (`user_uid`, `position_key_id`),
    KEY `idx_tb_account_user_position_position` (`position_key_id`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '员工职位关系表';

INSERT INTO `tb_account_position` (`name`, `sort`)
SELECT DISTINCT TRIM(`position_name`), 0
FROM `tb_account_user_organization`
WHERE `position_name` IS NOT NULL
  AND TRIM(`position_name`) <> ''
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT IGNORE INTO `tb_account_user_position` (`user_uid`, `position_key_id`)
SELECT uo.`user_uid`, p.`key_id`
FROM `tb_account_user_organization` uo
JOIN `tb_account_position` p ON p.`name` = TRIM(uo.`position_name`)
WHERE uo.`position_name` IS NOT NULL
  AND TRIM(uo.`position_name`) <> '';
