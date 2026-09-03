ALTER TABLE `tb_skyline_datetask_system`
    DROP INDEX `idx_tb_skyline_datetask_system_task_id`,
    ADD UNIQUE KEY `uk_tb_skyline_datetask_system_task_id` (`task_id`)
