-- 路由简化为 路由 + 路由通道 + 短信应用绑定 三层：删除路由规则表 tb_srm_route_rule，通道直接挂在路由下。
-- 路由覆盖的方向和类型由挂载的通道决定，选路时在路由通道中按短信的方向和类型筛选，再按优先级降级、同优先级按权重分流。
-- 路由类型改为创建时选择，不再按绑定关系自动切换；新增排序 sort，未绑定路由的短信应用按排序依次使用通用路由。
-- 原规则下的通道按所属路由合并，同一路由重复挂载的通道保留最早的一条。
-- 回滚：不可逆，如需回滚请从备份恢复 tb_srm_route_rule 和 tb_srm_route_channel。

ALTER TABLE `tb_srm_route`
    MODIFY COLUMN `type` varchar(32) NOT NULL DEFAULT 'general' COMMENT '路由类型：general=通用路由（不绑定短信应用；未绑定路由的短信应用，以及定向路由没有可用通道时，按排序依次使用）；targeted=定向路由（只供绑定的短信应用使用，没有可用通道时回落到通用路由）',
    ADD COLUMN `sort` int NOT NULL DEFAULT 0 COMMENT '排序：通用路由按排序从小到大依次尝试，数字越小越优先' AFTER `type`,
    DROP INDEX `idx_tb_srm_route_type`,
    ADD KEY `idx_tb_srm_route_type_sort` (`type`, `sort`);

ALTER TABLE `tb_srm_route_channel` ADD COLUMN `route_key_id` int NULL COMMENT '路由ID：SRM 路由主键' AFTER `key_id`;

UPDATE `tb_srm_route_channel` AS `channel`
INNER JOIN `tb_srm_route_rule` AS `rule` ON `rule`.`key_id` = `channel`.`rule_key_id`
SET `channel`.`route_key_id` = `rule`.`route_key_id`;

DELETE FROM `tb_srm_route_channel` WHERE `route_key_id` IS NULL;

DELETE `later` FROM `tb_srm_route_channel` AS `later`
INNER JOIN `tb_srm_route_channel` AS `earlier`
    ON `earlier`.`route_key_id` = `later`.`route_key_id`
    AND `earlier`.`channel_key_id` = `later`.`channel_key_id`
    AND `earlier`.`key_id` < `later`.`key_id`;

ALTER TABLE `tb_srm_route_channel`
    DROP INDEX `uk_tb_srm_route_channel_rule_channel`,
    DROP COLUMN `rule_key_id`,
    MODIFY COLUMN `route_key_id` int NOT NULL COMMENT '路由ID：SRM 路由主键',
    MODIFY COLUMN `weight` int NOT NULL DEFAULT 100 COMMENT '分流权重：同一路由内同方向、同类型、同优先级的通道之间按权重比例分配',
    MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由通道状态：disable=停用（通道暂不参与该路由分流）；enable=启用（通道参与该路由分流）',
    ADD UNIQUE KEY `uk_tb_srm_route_channel_route_channel` (`route_key_id`, `channel_key_id`),
    COMMENT = 'SRM 路由通道表';

DROP TABLE IF EXISTS `tb_srm_route_rule`;
