START TRANSACTION;

UPDATE `tb_account_organization`
SET `parent_key_id` = `parent_key_id` + 1024000
WHERE `parent_key_id` BETWEEN 1 AND 1023999;

UPDATE `tb_account_organization_closure`
SET
    `ancestor_key_id` = `ancestor_key_id` + 1024000,
    `descendant_key_id` = `descendant_key_id` + 1024000
WHERE `ancestor_key_id` BETWEEN 1 AND 1023999
  AND `descendant_key_id` BETWEEN 1 AND 1023999;

UPDATE `tb_account_user_organization`
SET `organization_key_id` = `organization_key_id` + 1024000
WHERE `organization_key_id` BETWEEN 1 AND 1023999;

UPDATE `tb_account_role_data_scope_organization`
SET `organization_key_id` = `organization_key_id` + 1024000
WHERE `organization_key_id` BETWEEN 1 AND 1023999;

UPDATE `tb_account_organization`
SET `key_id` = `key_id` + 1024000
WHERE `key_id` BETWEEN 1 AND 1023999;

COMMIT;

ALTER TABLE `tb_account_organization` AUTO_INCREMENT = 1124000;
