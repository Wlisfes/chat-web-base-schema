-- 供应商账号增加头像地址。
-- 回滚：ALTER TABLE `tb_srm_user` DROP COLUMN `avatar`;

ALTER TABLE `tb_srm_user`
    ADD COLUMN `avatar` varchar(255) NULL COMMENT '头像' AFTER `password`;
