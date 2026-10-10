-- 客户表注释由“外部客户账号表”改为“消费客户账号表”，仅修改表注释，不影响数据。重复执行不产生变化。
-- 回滚：ALTER TABLE `tb_crm_user` COMMENT = '外部客户账号表';

ALTER TABLE `tb_crm_user` COMMENT = '消费客户账号表';
