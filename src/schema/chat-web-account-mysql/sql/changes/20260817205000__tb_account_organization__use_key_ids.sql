ALTER TABLE `tb_account_organization`
    ADD COLUMN `parent_key_id` int NULL COMMENT '父组织主键' AFTER `key_id`;

ALTER TABLE `tb_account_organization_closure`
    ADD COLUMN `ancestor_key_id` int NULL COMMENT '祖先组织主键' AFTER `key_id`,
    ADD COLUMN `descendant_key_id` int NULL COMMENT '后代组织主键' AFTER `ancestor_key_id`;

ALTER TABLE `tb_account_user_organization`
    ADD COLUMN `organization_key_id` int NULL COMMENT '组织主键' AFTER `user_uid`;

ALTER TABLE `tb_account_menu`
    ADD COLUMN `parent_key_id` int NULL COMMENT '父菜单主键' AFTER `key_id`;

ALTER TABLE `tb_account_user_role`
    ADD COLUMN `role_key_id` int NULL COMMENT '角色主键' AFTER `user_uid`;

ALTER TABLE `tb_account_role_menu`
    ADD COLUMN `role_key_id` int NULL COMMENT '角色主键' AFTER `key_id`,
    ADD COLUMN `menu_key_id` int NULL COMMENT '菜单主键' AFTER `role_key_id`;

ALTER TABLE `tb_account_role_data_scope`
    ADD COLUMN `role_key_id` int NULL COMMENT '角色主键' AFTER `key_id`;

ALTER TABLE `tb_account_role_data_scope_organization`
    ADD COLUMN `data_scope_key_id` int NULL COMMENT '数据范围规则主键' AFTER `key_id`,
    ADD COLUMN `organization_key_id` int NULL COMMENT '授权组织主键' AFTER `data_scope_key_id`;

UPDATE `tb_account_organization` AS `child`
JOIN `tb_account_organization` AS `parent`
    ON `parent`.`uid` = `child`.`parent_uid`
SET `child`.`parent_key_id` = `parent`.`key_id`;

UPDATE `tb_account_organization_closure` AS `closure`
JOIN `tb_account_organization` AS `ancestor`
    ON `ancestor`.`uid` = `closure`.`ancestor_uid`
JOIN `tb_account_organization` AS `descendant`
    ON `descendant`.`uid` = `closure`.`descendant_uid`
SET
    `closure`.`ancestor_key_id` = `ancestor`.`key_id`,
    `closure`.`descendant_key_id` = `descendant`.`key_id`;

UPDATE `tb_account_user_organization` AS `membership`
JOIN `tb_account_organization` AS `organization`
    ON `organization`.`uid` = `membership`.`organization_uid`
SET `membership`.`organization_key_id` = `organization`.`key_id`;

UPDATE `tb_account_menu` AS `child`
JOIN `tb_account_menu` AS `parent`
    ON `parent`.`uid` = `child`.`parent_uid`
SET `child`.`parent_key_id` = `parent`.`key_id`;

UPDATE `tb_account_user_role` AS `assignment`
JOIN `tb_account_role` AS `role`
    ON `role`.`uid` = `assignment`.`role_uid`
SET `assignment`.`role_key_id` = `role`.`key_id`;

UPDATE `tb_account_role_menu` AS `grant_row`
JOIN `tb_account_role` AS `role`
    ON `role`.`uid` = `grant_row`.`role_uid`
JOIN `tb_account_menu` AS `menu`
    ON `menu`.`uid` = `grant_row`.`menu_uid`
SET
    `grant_row`.`role_key_id` = `role`.`key_id`,
    `grant_row`.`menu_key_id` = `menu`.`key_id`;

UPDATE `tb_account_role_data_scope` AS `scope`
JOIN `tb_account_role` AS `role`
    ON `role`.`uid` = `scope`.`role_uid`
SET `scope`.`role_key_id` = `role`.`key_id`;

UPDATE `tb_account_role_data_scope_organization` AS `grant_row`
JOIN `tb_account_role_data_scope` AS `scope`
    ON `scope`.`uid` = `grant_row`.`data_scope_uid`
JOIN `tb_account_organization` AS `organization`
    ON `organization`.`uid` = `grant_row`.`organization_uid`
SET
    `grant_row`.`data_scope_key_id` = `scope`.`key_id`,
    `grant_row`.`organization_key_id` = `organization`.`key_id`;

CREATE TEMPORARY TABLE `tmp_account_key_id_validation` (
    `key_id` int NOT NULL
);

INSERT INTO `tmp_account_key_id_validation` (`key_id`)
SELECT `parent_key_id`
FROM `tb_account_organization`
WHERE `parent_uid` IS NOT NULL;

TRUNCATE TABLE `tmp_account_key_id_validation`;

INSERT INTO `tmp_account_key_id_validation` (`key_id`)
SELECT `parent_key_id`
FROM `tb_account_menu`
WHERE `parent_uid` IS NOT NULL;

DROP TEMPORARY TABLE `tmp_account_key_id_validation`;

ALTER TABLE `tb_account_organization_closure`
    MODIFY COLUMN `ancestor_key_id` int NOT NULL COMMENT '祖先组织主键',
    MODIFY COLUMN `descendant_key_id` int NOT NULL COMMENT '后代组织主键';

ALTER TABLE `tb_account_user_organization`
    MODIFY COLUMN `organization_key_id` int NOT NULL COMMENT '组织主键';

ALTER TABLE `tb_account_user_role`
    MODIFY COLUMN `role_key_id` int NOT NULL COMMENT '角色主键';

ALTER TABLE `tb_account_role_menu`
    MODIFY COLUMN `role_key_id` int NOT NULL COMMENT '角色主键',
    MODIFY COLUMN `menu_key_id` int NOT NULL COMMENT '菜单主键';

ALTER TABLE `tb_account_role_data_scope`
    MODIFY COLUMN `role_key_id` int NOT NULL COMMENT '角色主键';

ALTER TABLE `tb_account_role_data_scope_organization`
    MODIFY COLUMN `data_scope_key_id` int NOT NULL COMMENT '数据范围规则主键',
    MODIFY COLUMN `organization_key_id` int NOT NULL COMMENT '授权组织主键';

ALTER TABLE `tb_account_organization`
    DROP INDEX `uk_tb_account_organization_uid`,
    DROP INDEX `idx_tb_account_organization_parent_sort`,
    DROP COLUMN `uid`,
    DROP COLUMN `parent_uid`,
    ADD KEY `idx_tb_account_organization_parent_sort` (`parent_key_id`, `sort`);

ALTER TABLE `tb_account_organization_closure`
    DROP INDEX `uk_tb_account_organization_closure_path`,
    DROP INDEX `idx_tb_account_organization_closure_descendant_depth`,
    DROP COLUMN `ancestor_uid`,
    DROP COLUMN `descendant_uid`,
    ADD UNIQUE KEY `uk_tb_account_organization_closure_path` (`ancestor_key_id`, `descendant_key_id`),
    ADD KEY `idx_tb_account_organization_closure_descendant_depth` (`descendant_key_id`, `depth`);

ALTER TABLE `tb_account_user_organization`
    DROP INDEX `uk_tb_account_user_organization_member`,
    DROP INDEX `idx_tb_account_user_organization_org_status`,
    DROP COLUMN `organization_uid`,
    ADD UNIQUE KEY `uk_tb_account_user_organization_member` (`user_uid`, `organization_key_id`),
    ADD KEY `idx_tb_account_user_organization_org_status` (`organization_key_id`, `status`);

ALTER TABLE `tb_account_menu`
    DROP INDEX `uk_tb_account_menu_uid`,
    DROP INDEX `idx_tb_account_menu_parent_sort`,
    DROP COLUMN `uid`,
    DROP COLUMN `parent_uid`,
    ADD KEY `idx_tb_account_menu_parent_sort` (`parent_key_id`, `sort`);

ALTER TABLE `tb_account_user_role`
    DROP INDEX `uk_tb_account_user_role_assignment`,
    DROP INDEX `idx_tb_account_user_role_role`,
    DROP COLUMN `role_uid`,
    ADD UNIQUE KEY `uk_tb_account_user_role_assignment` (`user_uid`, `role_key_id`),
    ADD KEY `idx_tb_account_user_role_role` (`role_key_id`);

ALTER TABLE `tb_account_role_menu`
    DROP INDEX `uk_tb_account_role_menu_grant`,
    DROP INDEX `idx_tb_account_role_menu_menu`,
    DROP COLUMN `role_uid`,
    DROP COLUMN `menu_uid`,
    ADD UNIQUE KEY `uk_tb_account_role_menu_grant` (`role_key_id`, `menu_key_id`),
    ADD KEY `idx_tb_account_role_menu_menu` (`menu_key_id`);

ALTER TABLE `tb_account_role_data_scope`
    DROP INDEX `uk_tb_account_role_data_scope_uid`,
    DROP INDEX `uk_tb_account_role_data_scope_resource`,
    DROP COLUMN `uid`,
    DROP COLUMN `role_uid`,
    ADD UNIQUE KEY `uk_tb_account_role_data_scope_resource` (`role_key_id`, `resource_code`);

ALTER TABLE `tb_account_role_data_scope_organization`
    DROP INDEX `uk_tb_account_role_data_scope_organization_grant`,
    DROP INDEX `idx_tb_account_role_data_scope_organization_org`,
    DROP COLUMN `data_scope_uid`,
    DROP COLUMN `organization_uid`,
    ADD UNIQUE KEY `uk_tb_account_role_data_scope_organization_grant` (`data_scope_key_id`, `organization_key_id`),
    ADD KEY `idx_tb_account_role_data_scope_organization_org` (`organization_key_id`);

ALTER TABLE `tb_account_role`
    DROP INDEX `uk_tb_account_role_uid`,
    DROP COLUMN `uid`;
