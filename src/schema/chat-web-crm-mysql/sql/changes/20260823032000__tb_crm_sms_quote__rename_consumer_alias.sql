ALTER TABLE `tb_crm_sms_quote_draft`
    CHANGE COLUMN `client_alias` `consumer_alias` varchar(64) NULL COMMENT '客户别名快照';

ALTER TABLE `tb_crm_sms_quote`
    CHANGE COLUMN `client_alias` `consumer_alias` varchar(64) NULL COMMENT '客户别名快照';
