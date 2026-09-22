-- 超级管理员主键改为 1024100。
-- 清掉错误的部门角色映射，按当前组织重新生成部门角色，角色 key_id 与组织 key_id 保持一致。

START TRANSACTION;

-- 把旧部门角色上的用户分配迁到对应组织主键（code: legacy_dept_X -> 组织 legacy_X）。
UPDATE `tb_account_user_role` AS `assignment`
INNER JOIN `tb_account_role` AS `role`
    ON `role`.`key_id` = `assignment`.`role_key_id`
INNER JOIN `tb_account_organization` AS `organization`
    ON `organization`.`code` = CONCAT('legacy_', SUBSTRING(`role`.`code` FROM 13))
SET `assignment`.`role_key_id` = `organization`.`key_id`
WHERE `role`.`builtin` = 0
  AND `role`.`code` LIKE 'legacy_dept_%';

-- 超级管理员 1 -> 1024100
UPDATE `tb_account_user_role`
SET `role_key_id` = 1024100
WHERE `role_key_id` = 1;

UPDATE `tb_account_role_menu`
SET `role_key_id` = 1024100
WHERE `role_key_id` = 1;

UPDATE `tb_account_role_data_scope`
SET `role_key_id` = 1024100
WHERE `role_key_id` = 1;

UPDATE `tb_account_role`
SET `key_id` = 1024100, `sort` = 0
WHERE `key_id` = 1 AND `code` = 'super_admin';

-- 删除仍指向旧部门角色的用户关系，以及旧部门角色本身。
DELETE `assignment`
FROM `tb_account_user_role` AS `assignment`
INNER JOIN `tb_account_role` AS `role`
    ON `role`.`key_id` = `assignment`.`role_key_id`
WHERE `role`.`builtin` = 0;

DELETE `grant_row`
FROM `tb_account_role_data_scope_organization` AS `grant_row`
INNER JOIN `tb_account_role_data_scope` AS `scope`
    ON `scope`.`key_id` = `grant_row`.`data_scope_key_id`
INNER JOIN `tb_account_role` AS `role`
    ON `role`.`key_id` = `scope`.`role_key_id`
WHERE `role`.`builtin` = 0;

DELETE `scope`
FROM `tb_account_role_data_scope` AS `scope`
INNER JOIN `tb_account_role` AS `role`
    ON `role`.`key_id` = `scope`.`role_key_id`
WHERE `role`.`builtin` = 0;

DELETE `grant_row`
FROM `tb_account_role_menu` AS `grant_row`
INNER JOIN `tb_account_role` AS `role`
    ON `role`.`key_id` = `grant_row`.`role_key_id`
WHERE `role`.`builtin` = 0;

DELETE FROM `tb_account_role`
WHERE `builtin` = 0;

-- 按当前组织重建部门角色，主键与组织主键一致。
INSERT INTO `tb_account_role` (`key_id`, `code`, `name`, `description`, `sort`, `builtin`, `status`)
SELECT
    `key_id`,
    CONCAT('dept_', `key_id`),
    `name`,
    CONCAT('部门角色：', `name`),
    `sort`,
    0,
    'enabled'
FROM `tb_account_organization`;

INSERT INTO `tb_account_role_data_scope` (`role_key_id`, `resource_code`, `scope_type`, `status`)
SELECT `key_id`, '*', 'custom', 'enabled'
FROM `tb_account_organization`;

INSERT INTO `tb_account_role_data_scope_organization` (`data_scope_key_id`, `organization_key_id`, `include_children`)
SELECT `scope`.`key_id`, `scope`.`role_key_id`, 1
FROM `tb_account_role_data_scope` AS `scope`
INNER JOIN `tb_account_role` AS `role`
    ON `role`.`key_id` = `scope`.`role_key_id`
WHERE `role`.`builtin` = 0
  AND `scope`.`resource_code` = '*';

COMMIT;

ALTER TABLE `tb_account_role` AUTO_INCREMENT = 1024100;
