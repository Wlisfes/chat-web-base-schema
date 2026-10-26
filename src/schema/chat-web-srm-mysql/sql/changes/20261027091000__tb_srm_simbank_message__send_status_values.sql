-- 发送状态值调整：发送成功使用 success，发送失败使用 failed。
-- 回滚：UPDATE `tb_srm_simbank_message` SET `send_status` = 'sent' WHERE `send_status` = 'success'; UPDATE `tb_srm_simbank_message` SET `send_status` = 'send_failed' WHERE `send_status` = 'failed'; 再恢复上一版字段注释。

UPDATE `tb_srm_simbank_message`
SET `send_status` = CASE `send_status`
    WHEN 'sent' THEN 'success'
    WHEN 'send_failed' THEN 'failed'
    ELSE `send_status`
END
WHERE `send_status` IN ('sent', 'send_failed');

ALTER TABLE `tb_srm_simbank_message`
    MODIFY COLUMN `send_status` varchar(32) NULL COMMENT '发送状态：delivered=已送达（短信已送达接收号码）；failed=发送失败（设备发送短信失败）；submit_failed=提交失败（短信未能提交到设备）；submitted=提交成功（短信已提交到设备，等待设备发送）；success=发送成功（设备已发出短信，等待送达回执）；unknown=未知（未获取到明确的发送结果）';
