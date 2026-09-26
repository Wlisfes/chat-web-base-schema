-- 职位管理页面已下线（职位迁移为 Skyline 枚举 CHUNK_ACCOUNT_POSITION），删除残留的职位菜单、按钮权限及角色授权。
-- 按 permission_code 定位，幂等可重复执行。回滚：按 20260902 职位菜单种子重新插入菜单并补充角色授权。

DELETE rm FROM `tb_account_role_menu` rm
JOIN `tb_account_menu` m ON m.`key_id` = rm.`menu_key_id`
WHERE m.`permission_code` = 'chat:deploy:system:position' OR m.`permission_code` LIKE 'chat:deploy:system:position:%';

DELETE FROM `tb_account_menu`
WHERE `permission_code` LIKE 'chat:deploy:system:position:%';

DELETE FROM `tb_account_menu`
WHERE `permission_code` = 'chat:deploy:system:position';
