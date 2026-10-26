-- 发送状态拆分为提交、设备发送和送达三个阶段；原未送达表示设备发送失败，统一改为 send_failed。
-- 回滚：UPDATE `tb_srm_simbank_message` SET `send_status` = 'undelivered' WHERE `send_status` IN ('send_failed', 'submit_failed'); UPDATE `tb_srm_simbank_message` SET `send_status` = 'submitted' WHERE `send_status` = 'sent'; 再恢复旧字段注释。

UPDATE `tb_srm_simbank_message`
SET `send_status` = 'send_failed'
WHERE `send_status` = 'undelivered';

ALTER TABLE `tb_srm_simbank_message`
    MODIFY COLUMN `send_status` varchar(32) NULL COMMENT '发送状态：delivered=已送达（短信已送达接收号码）；send_failed=发送失败（设备发送短信失败）；sent=发送成功（设备已发出短信，等待送达回执）；submit_failed=提交失败（短信未能提交到设备）；submitted=提交成功（短信已提交到设备，等待设备发送）；unknown=未知（未获取到明确的发送结果）';
