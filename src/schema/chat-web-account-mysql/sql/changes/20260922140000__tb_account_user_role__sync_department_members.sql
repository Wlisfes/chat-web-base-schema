-- 部门角色默认关联当前启用部门成员：角色主键与组织主键一致。

INSERT INTO `tb_account_user_role` (`user_uid`, `role_key_id`)
SELECT DISTINCT `membership`.`user_uid`, `membership`.`organization_key_id`
FROM `tb_account_user_organization` AS `membership`
INNER JOIN `tb_account_role` AS `role`
    ON `role`.`key_id` = `membership`.`organization_key_id`
   AND `role`.`builtin` = 0
WHERE `membership`.`status` = 'enabled'
  AND NOT EXISTS (
      SELECT 1
      FROM `tb_account_user_role` AS `assignment`
      WHERE `assignment`.`user_uid` = `membership`.`user_uid`
        AND `assignment`.`role_key_id` = `membership`.`organization_key_id`
  );
