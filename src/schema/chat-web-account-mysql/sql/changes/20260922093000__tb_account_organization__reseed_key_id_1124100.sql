-- 上次 reseed 把 1~1023999 的历史主键加了 1024000，得到 1024xxx；
-- 同时又把 AUTO_INCREMENT 设成 1124000，之后新插入的组织变成 1124xxx。
-- 本变更按现有 key_id 顺序把全部组织主键重排为从 1124100 起连续自增，并同步父级、闭包、成员和数据范围引用。

START TRANSACTION;

-- 先整体搬到临时区间，避免与目标 1124100 起的新主键冲突。
UPDATE `tb_account_organization`
SET `parent_key_id` = `parent_key_id` + 20000000
WHERE `parent_key_id` IS NOT NULL;

UPDATE `tb_account_organization_closure`
SET
    `ancestor_key_id` = `ancestor_key_id` + 20000000,
    `descendant_key_id` = `descendant_key_id` + 20000000;

UPDATE `tb_account_user_organization`
SET `organization_key_id` = `organization_key_id` + 20000000;

UPDATE `tb_account_role_data_scope_organization`
SET `organization_key_id` = `organization_key_id` + 20000000;

UPDATE `tb_account_organization`
SET `key_id` = `key_id` + 20000000;

DROP TEMPORARY TABLE IF EXISTS `tmp_account_organization_key_map`;
CREATE TEMPORARY TABLE `tmp_account_organization_key_map` (
    `old_key_id` int NOT NULL PRIMARY KEY,
    `new_key_id` int NOT NULL UNIQUE
);

SET @next_organization_key_id := 1124099;

INSERT INTO `tmp_account_organization_key_map` (`old_key_id`, `new_key_id`)
SELECT `key_id`, (@next_organization_key_id := @next_organization_key_id + 1)
FROM `tb_account_organization`
ORDER BY `key_id` ASC;

UPDATE `tb_account_organization` AS `organization`
INNER JOIN `tmp_account_organization_key_map` AS `map`
    ON `map`.`old_key_id` = `organization`.`parent_key_id`
SET `organization`.`parent_key_id` = `map`.`new_key_id`;

UPDATE `tb_account_organization_closure` AS `closure`
INNER JOIN `tmp_account_organization_key_map` AS `map`
    ON `map`.`old_key_id` = `closure`.`ancestor_key_id`
SET `closure`.`ancestor_key_id` = `map`.`new_key_id`;

UPDATE `tb_account_organization_closure` AS `closure`
INNER JOIN `tmp_account_organization_key_map` AS `map`
    ON `map`.`old_key_id` = `closure`.`descendant_key_id`
SET `closure`.`descendant_key_id` = `map`.`new_key_id`;

UPDATE `tb_account_user_organization` AS `membership`
INNER JOIN `tmp_account_organization_key_map` AS `map`
    ON `map`.`old_key_id` = `membership`.`organization_key_id`
SET `membership`.`organization_key_id` = `map`.`new_key_id`;

UPDATE `tb_account_role_data_scope_organization` AS `grant_row`
INNER JOIN `tmp_account_organization_key_map` AS `map`
    ON `map`.`old_key_id` = `grant_row`.`organization_key_id`
SET `grant_row`.`organization_key_id` = `map`.`new_key_id`;

UPDATE `tb_account_organization` AS `organization`
INNER JOIN `tmp_account_organization_key_map` AS `map`
    ON `map`.`old_key_id` = `organization`.`key_id`
SET `organization`.`key_id` = `map`.`new_key_id`;

DROP TEMPORARY TABLE `tmp_account_organization_key_map`;

COMMIT;

-- DDL 会隐式提交。若表中已有数据，MySQL 会把 AUTO_INCREMENT 调整为 MAX(key_id)+1。
ALTER TABLE `tb_account_organization` AUTO_INCREMENT = 1124100;
