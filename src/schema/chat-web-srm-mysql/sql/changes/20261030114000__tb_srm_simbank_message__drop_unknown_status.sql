-- 移除未使用的 unknown 发送状态，只保留实际回执和提交流程会产生或消费的状态。
-- 回滚：恢复上一版字段注释并重新加入代码枚举；无需变更列类型。

ALTER TABLE `tb_srm_simbank_message`
    MODIFY COLUMN `send_status` varchar(32) NULL COMMENT '发送状态：delivered=已送达（短信已送达接收号码）；failed=发送失败（设备发送短信失败）；rejected=提交失败（短信未能提交到设备）；submitted=提交成功（短信已提交到设备，等待设备发送）；success=发送成功（设备已发出短信，等待送达回执）';
