-- 对齐菜单显示状态枚举注释，列类型与默认值保持 tinyint(1)/1 不变。
ALTER TABLE `tb_account_menu`
    MODIFY COLUMN `visible` tinyint(1) NOT NULL DEFAULT 1 COMMENT '菜单显示状态：0=隐藏（菜单不在前端导航中展示）；1=显示（菜单在前端导航中正常展示）';
