-- 设备短信记录保存 Channel 选路时命中的路由，便于按路由排查和统计。
-- 历史上行短信和旧数据没有路由，字段允许为空。
-- 回滚：ALTER TABLE `tb_srm_simbank_message` DROP INDEX `idx_tb_srm_simbank_message_route_create_time`, DROP COLUMN `route_alias`, DROP COLUMN `route_key_id`;

ALTER TABLE `tb_srm_simbank_message`
    ADD COLUMN `route_key_id` int NULL COMMENT '路由ID：Channel 选路时命中的路由主键' AFTER `status_message`,
    ADD COLUMN `route_alias` varchar(64) NULL COMMENT '路由别名快照' AFTER `route_key_id`,
    ADD KEY `idx_tb_srm_simbank_message_route_create_time` (`route_key_id`, `create_time`);
