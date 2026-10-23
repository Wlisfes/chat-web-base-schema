-- 路由新增归属人 owner_user_uid。已有路由用创建人回填。
-- 回滚：ALTER TABLE `tb_srm_route` DROP INDEX `idx_tb_srm_route_owner_user_uid`, DROP COLUMN `owner_user_uid`;

ALTER TABLE `tb_srm_route`
    ADD COLUMN `owner_user_uid` varchar(19) NULL COMMENT '归属人账号UID' AFTER `status`,
    ADD KEY `idx_tb_srm_route_owner_user_uid` (`owner_user_uid`);

UPDATE `tb_srm_route`
SET `owner_user_uid` = `create_by`
WHERE `owner_user_uid` IS NULL OR `owner_user_uid` = '';

ALTER TABLE `tb_srm_route`
    MODIFY COLUMN `owner_user_uid` varchar(19) NOT NULL COMMENT '归属人账号UID';
