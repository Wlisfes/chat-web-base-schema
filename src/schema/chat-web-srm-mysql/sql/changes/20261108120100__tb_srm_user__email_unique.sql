-- 供应商邮箱全表唯一。客户与供应商邮箱互斥由服务校验，不能只靠本库索引。
-- 回滚：ALTER TABLE `tb_srm_user` DROP INDEX `uk_tb_srm_user_email`;

ALTER TABLE `tb_srm_user`
    ADD UNIQUE KEY `uk_tb_srm_user_email` (`email`);
