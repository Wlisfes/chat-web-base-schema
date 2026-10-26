-- 发送状态值不使用下划线：提交失败由 submit_failed 改为 rejected。
-- 回滚：UPDATE `tb_srm_simbank_message` SET `send_status` = 'submit_failed' WHERE `send_status` = 'rejected'; 再恢复上一版字段注释。

UPDATE `tb_srm_simbank_message`
SET `send_status` = 'rejected'
WHERE `send_status` = 'submit_failed';

ALTER TABLE `tb_srm_simbank_message`
    MODIFY COLUMN `send_status` varchar(32) NULL COMMENT '发送状态：delivered=已送达（短信已送达接收号码）；failed=发送失败（设备发送短信失败）；rejected=提交失败（短信未能提交到设备）；submitted=提交成功（短信已提交到设备，等待设备发送）；success=发送成功（设备已发出短信，等待送达回执）；unknown=未知（未获取到明确的发送结果）';
