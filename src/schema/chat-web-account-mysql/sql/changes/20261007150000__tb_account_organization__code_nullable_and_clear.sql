-- 组织编码改为非必填，并清空历史编码；唯一索引允许多个 NULL。
-- 回滚：需先为每条记录补充唯一编码，再执行 ALTER TABLE `tb_account_organization` MODIFY `code` varchar(64) NOT NULL COMMENT '组织编码';

ALTER TABLE `tb_account_organization` MODIFY `code` varchar(64) NULL COMMENT '组织编码';
UPDATE `tb_account_organization` SET `code` = NULL;
