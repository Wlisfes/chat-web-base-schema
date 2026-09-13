-- 历史数据统一为 0/1，避免非零数值被隐式当作 true 使用。
UPDATE `tb_account_menu`
SET `visible` = CASE WHEN `visible` = 0 THEN 0 ELSE 1 END;

-- 明确使用 tinyint(1) 存储显示状态：0=false，1=true。
ALTER TABLE `tb_account_menu`
    MODIFY COLUMN `visible` tinyint(1) NOT NULL DEFAULT 1 COMMENT '菜单显示状态：0=隐藏（false）；1=显示（true）';
