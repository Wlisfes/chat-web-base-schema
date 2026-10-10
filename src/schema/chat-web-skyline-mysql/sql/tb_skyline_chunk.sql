CREATE TABLE IF NOT EXISTS `tb_skyline_chunk` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `pid` int NULL COMMENT '父枚举项主键；根节点为空',
    `module` varchar(32) NOT NULL DEFAULT 'CHUNK_SYSTEM' COMMENT '枚举所属模块：CHUNK_SYSTEM=系统；CHUNK_CRM=CRM；CHUNK_SRM=SRM',
    `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SYSTEM_ACCOUNT_USER_LEVEL=用户职级（Account 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）；CHUNK_CRM_CRM_USER_SOURCE=客户注册来源（CRM 客户注册来源，仅一级枚举项）；CHUNK_SYSTEM_COMMON_CONTACT_TYPE=联系方式（系统通用联系方式类型，仅一级枚举项）',
    `name` varchar(128) NOT NULL COMMENT '枚举项显示名称',
    `value` varchar(128) NOT NULL COMMENT '枚举项业务值',
    `json` text NOT NULL DEFAULT ('{}') COMMENT '枚举项扩展配置，默认空对象',
    `sort` int NOT NULL DEFAULT 0 COMMENT '枚举项排序值',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '枚举项状态：disable=禁用（枚举项不可用于业务选择）；enable=启用（枚举项可正常用于业务选择）',
    `allow_delete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否允许删除此枚举项',
    `allow_update` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否允许更新此枚举项',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_skyline_chunk_module_type_value` (`module`, `type`, `value`),
    KEY `idx_tb_skyline_chunk_pid` (`pid`),
    KEY `idx_tb_skyline_chunk_module_type_sort` (`module`, `type`, `sort`),
    KEY `idx_tb_skyline_chunk_status` (`status`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1024202
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Skyline 后端枚举字典表';

-- 岗位主数据迁入系统枚举，主键从 1024100 起号。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `key_id` BETWEEN 1024100 AND 1024169;

INSERT INTO `tb_skyline_chunk` (`key_id`, `pid`, `module`, `type`, `name`, `value`, `json`, `sort`, `status`, `allow_delete`, `allow_update`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`pid`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`value`, `seed`.`json`, `seed`.`sort`, `seed`.`status`, `seed`.`allow_delete`, `seed`.`allow_update`, '0', '0'
FROM (
    SELECT 1024100 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '外贸业务员' AS `name`, '1024100' AS `value`, '{}' AS `json`, 10 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024101 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '短信运营' AS `name`, '1024101' AS `value`, '{}' AS `json`, 20 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024102 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '产品经理' AS `name`, '1024102' AS `value`, '{}' AS `json`, 30 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024103 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '采购经理' AS `name`, '1024103' AS `value`, '{}' AS `json`, 40 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024104 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '商务拓展经理' AS `name`, '1024104' AS `value`, '{}' AS `json`, 50 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024105 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '资深销售' AS `name`, '1024105' AS `value`, '{}' AS `json`, 60 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024106 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '语音运营' AS `name`, '1024106' AS `value`, '{}' AS `json`, 70 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024107 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '策略运营' AS `name`, '1024107' AS `value`, '{}' AS `json`, 80 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024108 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '通讯技术' AS `name`, '1024108' AS `value`, '{}' AS `json`, 90 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024109 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '技术支持' AS `name`, '1024109' AS `value`, '{}' AS `json`, 100 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024110 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '品牌运营' AS `name`, '1024110' AS `value`, '{}' AS `json`, 110 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024111 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '运维工程师' AS `name`, '1024111' AS `value`, '{}' AS `json`, 120 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024112 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '销售经理' AS `name`, '1024112' AS `value`, '{}' AS `json`, 130 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024113 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '出纳' AS `name`, '1024113' AS `value`, '{}' AS `json`, 140 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024114 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '高级销售经理' AS `name`, '1024114' AS `value`, '{}' AS `json`, 150 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024115 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '算法工程师' AS `name`, '1024115' AS `value`, '{}' AS `json`, 160 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024116 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '会计' AS `name`, '1024116' AS `value`, '{}' AS `json`, 170 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024117 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '客服专员' AS `name`, '1024117' AS `value`, '{}' AS `json`, 180 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024118 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '品牌设计' AS `name`, '1024118' AS `value`, '{}' AS `json`, 190 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024119 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '人事' AS `name`, '1024119' AS `value`, '{}' AS `json`, 200 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024120 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '商务经理' AS `name`, '1024120' AS `value`, '{}' AS `json`, 210 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024121 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '数据开发工程师' AS `name`, '1024121' AS `value`, '{}' AS `json`, 220 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024122 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '销售总监' AS `name`, '1024122' AS `value`, '{}' AS `json`, 230 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024123 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '采购专员' AS `name`, '1024123' AS `value`, '{}' AS `json`, 240 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024124 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '仓库管理员' AS `name`, '1024124' AS `value`, '{}' AS `json`, 250 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024125 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '测试工程师' AS `name`, '1024125' AS `value`, '{}' AS `json`, 260 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024126 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '产研副总监' AS `name`, '1024126' AS `value`, '{}' AS `json`, 270 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024127 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '高级运营经理' AS `name`, '1024127' AS `value`, '{}' AS `json`, 280 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024128 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '客服' AS `name`, '1024128' AS `value`, '{}' AS `json`, 290 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024129 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '数据分析' AS `name`, '1024129' AS `value`, '{}' AS `json`, 300 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024130 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '数字营销' AS `name`, '1024130' AS `value`, '{}' AS `json`, 310 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024131 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '往来会计' AS `name`, '1024131' AS `value`, '{}' AS `json`, 320 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024132 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '系统架构师' AS `name`, '1024132' AS `value`, '{}' AS `json`, 330 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024133 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '项目经理' AS `name`, '1024133' AS `value`, '{}' AS `json`, 340 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024134 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '销售专员' AS `name`, '1024134' AS `value`, '{}' AS `json`, 350 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024135 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '行政' AS `name`, '1024135' AS `value`, '{}' AS `json`, 360 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024136 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '运营经理' AS `name`, '1024136' AS `value`, '{}' AS `json`, 370 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024137 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '招聘' AS `name`, '1024137' AS `value`, '{}' AS `json`, 380 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024138 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, 'JAVA开发工程师' AS `name`, '1024138' AS `value`, '{}' AS `json`, 390 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024139 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, 'UI设计' AS `name`, '1024139' AS `value`, '{}' AS `json`, 400 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024140 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '财务经理' AS `name`, '1024140' AS `value`, '{}' AS `json`, 410 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024141 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '采购总监' AS `name`, '1024141' AS `value`, '{}' AS `json`, 420 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024142 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '仓库管理' AS `name`, '1024142' AS `value`, '{}' AS `json`, 430 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024143 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '产品研发总监' AS `name`, '1024143' AS `value`, '{}' AS `json`, 440 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024144 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '产研高级总监' AS `name`, '1024144' AS `value`, '{}' AS `json`, 450 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024145 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '产研总监' AS `name`, '1024145' AS `value`, '{}' AS `json`, 460 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024146 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '董事长' AS `name`, '1024146' AS `value`, '{}' AS `json`, 470 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024147 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '法务' AS `name`, '1024147' AS `value`, '{}' AS `json`, 480 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024148 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '供应链经理' AS `name`, '1024148' AS `value`, '{}' AS `json`, 490 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024149 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '品牌策划' AS `name`, '1024149' AS `value`, '{}' AS `json`, 500 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024150 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '软件测试工程师' AS `name`, '1024150' AS `value`, '{}' AS `json`, 510 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024151 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '扫码员' AS `name`, '1024151' AS `value`, '{}' AS `json`, 520 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024152 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '市场副总监' AS `name`, '1024152' AS `value`, '{}' AS `json`, 530 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024153 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '售后技术支持' AS `name`, '1024153' AS `value`, '{}' AS `json`, 540 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024154 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '通讯技术经理' AS `name`, '1024154' AS `value`, '{}' AS `json`, 550 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024155 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '研发经理' AS `name`, '1024155' AS `value`, '{}' AS `json`, 560 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024156 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '研发主管' AS `name`, '1024156' AS `value`, '{}' AS `json`, 570 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024157 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '硬件测试工程师' AS `name`, '1024157' AS `value`, '{}' AS `json`, 580 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024158 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '硬件工程师' AS `name`, '1024158' AS `value`, '{}' AS `json`, 590 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024159 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '运维主管' AS `name`, '1024159' AS `value`, '{}' AS `json`, 600 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024160 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '运营专员' AS `name`, '1024160' AS `value`, '{}' AS `json`, 610 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024161 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '运营总监' AS `name`, '1024161' AS `value`, '{}' AS `json`, 620 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024162 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '质检专员' AS `name`, '1024162' AS `value`, '{}' AS `json`, 630 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024163 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '总账会计' AS `name`, '1024163' AS `value`, '{}' AS `json`, 640 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024164 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, 'CHO' AS `name`, '1024164' AS `value`, '{}' AS `json`, 650 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024165 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '前端开发工程师' AS `name`, '1024165' AS `value`, '{}' AS `json`, 660 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024166 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '高级采购经理' AS `name`, '1024166' AS `value`, '{}' AS `json`, 670 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024167 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '行政经理' AS `name`, '1024167' AS `value`, '{}' AS `json`, 680 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024168 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '人事经理' AS `name`, '1024168' AS `value`, '{}' AS `json`, 690 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024169 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '招聘经理' AS `name`, '1024169' AS `value`, '{}' AS `json`, 700 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`key_id` = `seed`.`key_id`
       OR (`chunk`.`module` = `seed`.`module` AND `chunk`.`type` = `seed`.`type` AND `chunk`.`value` = `seed`.`value`)
);

-- 用户职级：P1-P8 专业序列、M1-M8 管理序列，主键即枚举 value。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `key_id` BETWEEN 1024170 AND 1024185 AND `type` = 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL';

INSERT INTO `tb_skyline_chunk` (`key_id`, `pid`, `module`, `type`, `name`, `value`, `json`, `sort`, `status`, `allow_delete`, `allow_update`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`pid`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`value`, `seed`.`json`, `seed`.`sort`, `seed`.`status`, `seed`.`allow_delete`, `seed`.`allow_update`, '0', '0'
FROM (
    SELECT 1024170 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P1' AS `name`, '1024170' AS `value`, '{}' AS `json`, 10 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024171 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P2' AS `name`, '1024171' AS `value`, '{}' AS `json`, 20 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024172 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P3' AS `name`, '1024172' AS `value`, '{}' AS `json`, 30 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024173 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P4' AS `name`, '1024173' AS `value`, '{}' AS `json`, 40 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024174 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P5' AS `name`, '1024174' AS `value`, '{}' AS `json`, 50 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024175 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P6' AS `name`, '1024175' AS `value`, '{}' AS `json`, 60 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024176 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P7' AS `name`, '1024176' AS `value`, '{}' AS `json`, 70 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024177 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P8' AS `name`, '1024177' AS `value`, '{}' AS `json`, 80 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024178 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M1' AS `name`, '1024178' AS `value`, '{}' AS `json`, 90 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024179 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M2' AS `name`, '1024179' AS `value`, '{}' AS `json`, 100 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024180 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M3' AS `name`, '1024180' AS `value`, '{}' AS `json`, 110 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024181 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M4' AS `name`, '1024181' AS `value`, '{}' AS `json`, 120 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024182 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M5' AS `name`, '1024182' AS `value`, '{}' AS `json`, 130 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024183 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M6' AS `name`, '1024183' AS `value`, '{}' AS `json`, 140 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024184 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M7' AS `name`, '1024184' AS `value`, '{}' AS `json`, 150 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024185 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M8' AS `name`, '1024185' AS `value`, '{}' AS `json`, 160 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`key_id` = `seed`.`key_id`
       OR (`chunk`.`module` = `seed`.`module` AND `chunk`.`type` = `seed`.`type` AND (`chunk`.`value` = `seed`.`value` OR `chunk`.`name` = `seed`.`name`))
);

-- CRM 客户注册来源：手动创建、平台注册，主键即枚举 value。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `key_id` IN (1024186, 1024187) AND `type` = 'CHUNK_CRM_CRM_USER_SOURCE';

INSERT INTO `tb_skyline_chunk` (`key_id`, `pid`, `module`, `type`, `name`, `value`, `json`, `sort`, `status`, `allow_delete`, `allow_update`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`pid`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`value`, `seed`.`json`, `seed`.`sort`, `seed`.`status`, `seed`.`allow_delete`, `seed`.`allow_update`, '0', '0'
FROM (
    SELECT 1024186 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_CRM' AS `module`, 'CHUNK_CRM_CRM_USER_SOURCE' AS `type`, '手动创建' AS `name`, '1024186' AS `value`, '{}' AS `json`, 10 AS `sort`, 'enable' AS `status`, 0 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024187 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_CRM' AS `module`, 'CHUNK_CRM_CRM_USER_SOURCE' AS `type`, '平台注册' AS `name`, '1024187' AS `value`, '{}' AS `json`, 20 AS `sort`, 'enable' AS `status`, 0 AS `allow_delete`, 1 AS `allow_update`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`key_id` = `seed`.`key_id`
       OR (`chunk`.`module` = `seed`.`module` AND `chunk`.`type` = `seed`.`type` AND (`chunk`.`value` = `seed`.`value` OR `chunk`.`name` = `seed`.`name`))
);

-- 系统联系方式：邮箱、Facebook、Line 等 14 种，主键即枚举 value。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `key_id` BETWEEN 1024188 AND 1024201 AND `type` = 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE';

INSERT INTO `tb_skyline_chunk` (`key_id`, `pid`, `module`, `type`, `name`, `value`, `json`, `sort`, `status`, `allow_delete`, `allow_update`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`pid`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`value`, `seed`.`json`, `seed`.`sort`, `seed`.`status`, `seed`.`allow_delete`, `seed`.`allow_update`, '0', '0'
FROM (
    SELECT 1024188 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '邮箱' AS `name`, '1024188' AS `value`, '{}' AS `json`, 10 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024189 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Facebook' AS `name`, '1024189' AS `value`, '{}' AS `json`, 20 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024190 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Line' AS `name`, '1024190' AS `value`, '{}' AS `json`, 30 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024191 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'LinkedIn' AS `name`, '1024191' AS `value`, '{}' AS `json`, 40 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024192 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Skype' AS `name`, '1024192' AS `value`, '{}' AS `json`, 50 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024193 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'WhatsApp' AS `name`, '1024193' AS `value`, '{}' AS `json`, 60 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024194 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Zalo' AS `name`, '1024194' AS `value`, '{}' AS `json`, 70 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024195 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '企业微信' AS `name`, '1024195' AS `value`, '{}' AS `json`, 80 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024196 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Telegram' AS `name`, '1024196' AS `value`, '{}' AS `json`, 90 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024197 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'QQ' AS `name`, '1024197' AS `value`, '{}' AS `json`, 100 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024198 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Viber' AS `name`, '1024198' AS `value`, '{}' AS `json`, 110 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024199 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '微信（Wechat）' AS `name`, '1024199' AS `value`, '{}' AS `json`, 120 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024200 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '电话' AS `name`, '1024200' AS `value`, '{}' AS `json`, 130 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024201 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '在线客服' AS `name`, '1024201' AS `value`, '{}' AS `json`, 140 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`key_id` = `seed`.`key_id`
       OR (`chunk`.`module` = `seed`.`module` AND `chunk`.`type` = `seed`.`type` AND (`chunk`.`value` = `seed`.`value` OR `chunk`.`name` = `seed`.`name`))
);
