-- 菜单权限表统一改名为 sheet：tb_account_menu -> tb_account_sheet，tb_account_role_menu -> tb_account_role_sheet，menu_key_id -> sheet_key_id；数据保留。
-- 回滚：按相反顺序执行 RENAME INDEX、CHANGE COLUMN 与 RENAME TABLE。

RENAME TABLE `tb_account_menu` TO `tb_account_sheet`,
    `tb_account_role_menu` TO `tb_account_role_sheet`;

ALTER TABLE `tb_account_sheet`
    RENAME INDEX `uk_tb_account_menu_permission_code` TO `uk_tb_account_sheet_permission_code`,
    RENAME INDEX `idx_tb_account_menu_parent_sort` TO `idx_tb_account_sheet_parent_sort`;

ALTER TABLE `tb_account_role_sheet`
    CHANGE COLUMN `menu_key_id` `sheet_key_id` int NOT NULL COMMENT '菜单主键',
    RENAME INDEX `uk_tb_account_role_menu_grant` TO `uk_tb_account_role_sheet_grant`,
    RENAME INDEX `idx_tb_account_role_menu_menu` TO `idx_tb_account_role_sheet_sheet`;
