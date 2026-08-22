START TRANSACTION;

UPDATE `tb_account_consumer`
SET `key_id` = -`key_id`
WHERE `key_id` > 0
ORDER BY `key_id` ASC;

UPDATE `tb_account_consumer`
SET `key_id` = 5180999 - `key_id`
WHERE `key_id` < 0
ORDER BY `key_id` DESC;

COMMIT;

ALTER TABLE `tb_account_consumer` AUTO_INCREMENT = 5181000;
