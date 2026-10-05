-- 财务品牌表主键已整体平移 +1000（见 Finance 库迁移 20261005130000__tb_finance_brand__auto_increment_1001.sql），
-- 客户表关联的品牌主键同步平移；只处理小于 1001 的旧值，重复执行不产生变化。
-- 回滚：UPDATE `tb_crm_user` SET `brand_key_id` = `brand_key_id` - 1000 WHERE `brand_key_id` >= 1001;

UPDATE `tb_crm_user`
SET `brand_key_id` = `brand_key_id` + 1000
WHERE `brand_key_id` > 0 AND `brand_key_id` < 1001;
