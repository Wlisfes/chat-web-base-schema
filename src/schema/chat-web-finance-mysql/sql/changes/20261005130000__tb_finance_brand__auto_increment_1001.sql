-- 财务品牌表主键改为从 1001 起号：已有品牌主键整体平移 +1000（1 -> 1001、2 -> 1002 ...），新数据从 1001 之后继续自增。
-- 客户表 tb_crm_user.brand_key_id 的关联值由 CRM 库迁移 20261005130100__tb_crm_user__shift_brand_key_id.sql 同步平移。
-- 只平移小于 1001 的旧主键，重复执行不产生变化；InnoDB 会自动把 AUTO_INCREMENT 修正为不小于 MAX(key_id) + 1。
-- 回滚：UPDATE `tb_finance_brand` SET `key_id` = `key_id` - 1000 WHERE `key_id` >= 1001 ORDER BY `key_id` ASC; ALTER TABLE `tb_finance_brand` AUTO_INCREMENT = 1;

UPDATE `tb_finance_brand`
SET `key_id` = `key_id` + 1000
WHERE `key_id` < 1001
ORDER BY `key_id` DESC;

ALTER TABLE `tb_finance_brand` AUTO_INCREMENT = 1001;
