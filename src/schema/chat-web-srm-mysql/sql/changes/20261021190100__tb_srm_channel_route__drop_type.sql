-- 路由的短信类型改为取自通道类型：删除路由 type 字段；同一通道在同一方向只能有一条路由。
-- 回滚：ALTER TABLE `tb_srm_channel_route` DROP INDEX `uk_tb_srm_channel_route_channel_country`, DROP INDEX `idx_tb_srm_channel_route_country_key_id`, ADD COLUMN `type` varchar(32) NULL COMMENT '短信类型' AFTER `country_key_id`, ADD INDEX `idx_tb_srm_channel_route_country_type` (`country_key_id`, `type`), ADD INDEX `idx_tb_srm_channel_route_channel_key_id` (`channel_key_id`);

ALTER TABLE `tb_srm_channel_route`
    DROP INDEX `idx_tb_srm_channel_route_country_type`,
    DROP INDEX `idx_tb_srm_channel_route_channel_key_id`,
    DROP COLUMN `type`,
    ADD UNIQUE INDEX `uk_tb_srm_channel_route_channel_country` (`channel_key_id`, `country_key_id`),
    ADD INDEX `idx_tb_srm_channel_route_country_key_id` (`country_key_id`);