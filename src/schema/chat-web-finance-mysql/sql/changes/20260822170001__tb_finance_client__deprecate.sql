RENAME TABLE
    `tb_finance_client` TO `tb_finance_client_deprecated_20260822`,
    `tb_finance_client_tag` TO `tb_finance_client_tag_deprecated_20260822`,
    `tb_finance_client_share` TO `tb_finance_client_share_deprecated_20260822`,
    `tb_finance_client_settings` TO `tb_finance_client_settings_deprecated_20260822`;

-- 旧表仅重命名保留，不在本次变更中删除数据。
-- 如需回滚，先确认新旧服务均已停止写入，再将四张表重命名为原名称。
