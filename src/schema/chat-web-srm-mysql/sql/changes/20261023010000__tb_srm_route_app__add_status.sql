-- 短信应用路由绑定增加状态：停用后按未绑定处理，走同类型路由优先级。
-- 回滚：ALTER TABLE `tb_srm_route_app` DROP COLUMN `status`;

ALTER TABLE `tb_srm_route_app`
    ADD COLUMN `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '短信应用绑定状态：disable=停用（绑定暂不生效，按未绑定走同类型路由）；enable=启用（短信优先走该路由）' AFTER `route_key_id`;
