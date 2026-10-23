-- 路由 sort 改为 priority：通用路由按优先级从小到大依次尝试，1 最优先，最大 100。
-- 原 sort 小于 1 的记为 1，大于 100 的记为 100。
-- 回滚：ALTER TABLE `tb_srm_route` DROP INDEX `idx_tb_srm_route_type_priority`, DROP COLUMN `priority`, ADD COLUMN `sort` int NOT NULL DEFAULT 0 COMMENT '排序：通用路由按排序从小到大依次尝试，数字越小越优先' AFTER `type`, ADD KEY `idx_tb_srm_route_type_sort` (`type`, `sort`), MODIFY COLUMN `type` varchar(32) NOT NULL DEFAULT 'general' COMMENT '路由类型：general=通用路由（不绑定短信应用；未绑定路由的短信应用，以及定向路由没有可用通道时，按排序依次使用）；targeted=定向路由（只供绑定的短信应用使用，没有可用通道时回落到通用路由）';

ALTER TABLE `tb_srm_route`
    ADD COLUMN `priority` int NOT NULL DEFAULT 1 COMMENT '优先级：通用路由按优先级从小到大依次尝试，1 最优先，最大 100' AFTER `type`;

UPDATE `tb_srm_route`
SET `priority` = LEAST(GREATEST(`sort`, 1), 100);

ALTER TABLE `tb_srm_route`
    DROP INDEX `idx_tb_srm_route_type_sort`,
    DROP COLUMN `sort`,
    ADD KEY `idx_tb_srm_route_type_priority` (`type`, `priority`),
    MODIFY COLUMN `type` varchar(32) NOT NULL DEFAULT 'general' COMMENT '路由类型：general=通用路由（不绑定短信应用；未绑定路由的短信应用，以及定向路由没有可用通道时，按优先级依次使用）；targeted=定向路由（只供绑定的短信应用使用，没有可用通道时回落到通用路由）';
