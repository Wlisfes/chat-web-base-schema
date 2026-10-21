-- 路由去掉唯一的默认路由标记 is_default，改为路由类型 type：
-- general=通用路由（没有绑定短信应用，所有应用都可回落使用，可以有多条）；targeted=定向路由（已绑定短信应用）。
-- 类型由短信应用绑定关系自动维护：新增路由为通用，绑定应用后变为定向，解绑到没有应用后变回通用。
-- 回滚：ALTER TABLE `tb_srm_route` ADD COLUMN `is_default` tinyint(1) NOT NULL DEFAULT 0 AFTER `alias`, DROP INDEX `idx_tb_srm_route_type`, DROP COLUMN `type`, ADD KEY `idx_tb_srm_route_is_default` (`is_default`); 再手工标记一条默认路由。

ALTER TABLE `tb_srm_route`
    ADD COLUMN `type` varchar(32) NOT NULL DEFAULT 'general' COMMENT '路由类型：general=通用路由（没有绑定短信应用，所有短信应用都可回落使用）；targeted=定向路由（已绑定短信应用，只供绑定的短信应用使用）' AFTER `alias`,
    MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由状态：disable=停用（路由不参与选路，绑定该路由的短信应用回落到通用路由）；enable=启用（路由参与选路）',
    ADD KEY `idx_tb_srm_route_type` (`type`);

UPDATE `tb_srm_route` AS `route`
SET `route`.`type` = 'targeted'
WHERE EXISTS (SELECT 1 FROM `tb_srm_route_app` AS `app` WHERE `app`.`route_key_id` = `route`.`key_id`);

ALTER TABLE `tb_srm_route`
    DROP INDEX `idx_tb_srm_route_is_default`,
    DROP COLUMN `is_default`;

ALTER TABLE `tb_srm_route_rule`
    MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由规则状态：disable=停用（规则不参与匹配，继续匹配更粗粒度规则或通用路由）；enable=启用（规则参与匹配）';
