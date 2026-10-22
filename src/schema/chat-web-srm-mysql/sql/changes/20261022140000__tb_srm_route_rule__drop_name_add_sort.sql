-- 规则组去掉名称 name，新增排序 sort：规则组之间是“或”，排序只决定展示和匹配顺序。
-- 回滚：ALTER TABLE `tb_srm_route_rule` DROP INDEX `idx_tb_srm_route_rule_route_sort`, DROP COLUMN `sort`, ADD COLUMN `name` varchar(64) NOT NULL DEFAULT '' COMMENT '规则组名称' AFTER `route_key_id`, ADD KEY `idx_tb_srm_route_rule_route_key_id` (`route_key_id`);

ALTER TABLE `tb_srm_route_rule`
    DROP COLUMN `name`,
    ADD COLUMN `sort` int NOT NULL DEFAULT 0 COMMENT '排序：规则组的展示和匹配顺序，数字越小越靠前；规则组之间是“或”，排序不影响是否命中' AFTER `route_key_id`,
    DROP INDEX `idx_tb_srm_route_rule_route_key_id`,
    ADD KEY `idx_tb_srm_route_rule_route_sort` (`route_key_id`, `sort`);
