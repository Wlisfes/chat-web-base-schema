SET @email_index_exists = (
    SELECT COUNT(*)
    FROM `information_schema`.`statistics`
    WHERE `table_schema` = DATABASE()
      AND `table_name` = 'tb_account_user'
      AND `index_name` = 'uk_tb_account_user_email'
);

SET @email_index_sql = IF(
    @email_index_exists = 0,
    'ALTER TABLE `tb_account_user` ADD UNIQUE KEY `uk_tb_account_user_email` (`email`)',
    'SELECT 1'
);

PREPARE email_index_statement FROM @email_index_sql;
EXECUTE email_index_statement;
DEALLOCATE PREPARE email_index_statement;
