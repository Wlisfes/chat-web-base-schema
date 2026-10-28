import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, DateWithColumn, defineEnumMetadata } from '@/utils'

export enum TbSrmBillingOutboxColumn {
    KEY_ID = 'key_id',
    EVENT_ID = 'event_id',
    MSG_ID = 'msg_id',
    TRIGGER = 'trigger',
    PAYLOAD = 'payload',
    STATUS = 'status',
    ATTEMPTS = 'attempts',
    LAST_ERROR = 'last_error',
    PUBLISHED_TIME = 'published_time',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmBillingOutboxTrigger {
    SUBMITTED = 'submitted',
    SUCCESS = 'success'
}

export const TbSrmBillingOutboxTriggerDefinition = defineEnumMetadata(TbSrmBillingOutboxTrigger, '计费触发节点', {
    [TbSrmBillingOutboxTrigger.SUBMITTED]: { label: '提交设备', description: '预付供应商：短信提交到设备即计费', type: 'info' },
    [TbSrmBillingOutboxTrigger.SUCCESS]: { label: '发送成功', description: '后付供应商：设备发送成功才计费', type: 'success' }
})

export enum TbSrmBillingOutboxStatus {
    PENDING = 'pending',
    PUBLISHED = 'published'
}

export const TbSrmBillingOutboxStatusDefinition = defineEnumMetadata(TbSrmBillingOutboxStatus, '计费事件发布状态', {
    [TbSrmBillingOutboxStatus.PENDING]: { label: '待发布', description: '已随发送记录写入，等待发布到 MQ', type: 'warning' },
    [TbSrmBillingOutboxStatus.PUBLISHED]: { label: '已发布', description: '已发布到 MQ，由 Finance 落账', type: 'success' }
})

export class TbSrmBillingOutboxDto extends DataBaseDto {
    @ApiProperty({
        description: '计费事件ID：msgId + 触发节点，Finance 按它幂等落账',
        example: 'c2f45ce1-30a5-4d14-b0d7-cb76b10f0e21:submitted'
    })
    @IsString({ message: '计费事件ID必须是字符串' })
    @IsNotEmpty({ message: '计费事件ID必填' })
    @MaxLength(64, { message: '计费事件ID长度不能超过64位' })
    eventId: string

    @ApiProperty({ description: '短信ID：SMS 提交时生成', example: 'c2f45ce1-30a5-4d14-b0d7-cb76b10f0e21' })
    @IsString({ message: '短信ID必须是字符串' })
    @MaxLength(36, { message: '短信ID长度不能超过36位' })
    msgId: string

    @ApiProperty({
        description: TbSrmBillingOutboxTriggerDefinition.comment,
        enum: TbSrmBillingOutboxTrigger,
        enumName: 'TbSrmBillingOutboxTrigger'
    })
    @IsEnum(TbSrmBillingOutboxTrigger, { message: '计费触发节点格式错误' })
    trigger: TbSrmBillingOutboxTrigger

    @ApiProperty({
        description: '计费事件内容 JSON：发布到 MQ 的完整消息体',
        example: '{"eventId":"c2f45ce1-30a5-4d14-b0d7-cb76b10f0e21:submitted"}'
    })
    @IsString({ message: '计费事件内容必须是字符串' })
    payload: string

    @ApiProperty({
        description: TbSrmBillingOutboxStatusDefinition.comment,
        enum: TbSrmBillingOutboxStatus,
        enumName: 'TbSrmBillingOutboxStatus'
    })
    @IsEnum(TbSrmBillingOutboxStatus, { message: '计费事件发布状态格式错误' })
    status: TbSrmBillingOutboxStatus

    @ApiProperty({ description: '发布尝试次数', example: 0 })
    @Type(() => Number)
    @IsInt({ message: '发布尝试次数必须是整数' })
    @Min(0, { message: '发布尝试次数不能小于0' })
    attempts: number

    @ApiProperty({ description: '最近一次发布失败原因', required: false, example: 'RabbitMQ 通道尚未就绪' })
    @IsOptional()
    @IsString({ message: '发布失败原因必须是字符串' })
    @MaxLength(512, { message: '发布失败原因长度不能超过512位' })
    lastError: string

    @ApiProperty({ description: '发布到 MQ 的时间', required: false, example: '2026-10-28 10:00:00' })
    @IsOptional()
    publishedTime: Date
}

/**
 * SRM 计费事件发件箱：Dispatch 写入或写回发送记录时，在同一事务中插入供应商计费事件，提交后再发布到 MQ。
 * 发布失败或进程重启时由定时任务补发，保证发出的短信一定会产生计费事件；同一 eventId 只写入一次。
 */
@Index('uk_tb_srm_billing_outbox_event_id', ['eventId'], { unique: true })
@Index('idx_tb_srm_billing_outbox_status_create_time', ['status', 'createTime'])
@Entity({ name: 'tb_srm_billing_outbox', comment: 'SRM 供应商计费事件发件箱表' })
export class TbSrmBillingOutbox extends DataBaseAdapter {
    @Column({
        name: TbSrmBillingOutboxColumn.EVENT_ID,
        type: 'varchar',
        length: 64,
        nullable: false,
        comment: '计费事件ID：msgId + 触发节点'
    })
    eventId: string

    @Column({ name: TbSrmBillingOutboxColumn.MSG_ID, type: 'varchar', length: 36, nullable: false, comment: '短信ID' })
    msgId: string

    @Column({
        name: TbSrmBillingOutboxColumn.TRIGGER,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSrmBillingOutboxTriggerDefinition.comment
    })
    trigger: TbSrmBillingOutboxTrigger

    @Column({ name: TbSrmBillingOutboxColumn.PAYLOAD, type: 'text', nullable: false, comment: '计费事件内容 JSON' })
    payload: string

    @Column({
        name: TbSrmBillingOutboxColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSrmBillingOutboxStatus.PENDING,
        comment: TbSrmBillingOutboxStatusDefinition.comment
    })
    status: TbSrmBillingOutboxStatus

    @Column({ name: TbSrmBillingOutboxColumn.ATTEMPTS, type: 'int', nullable: false, default: 0, comment: '发布尝试次数' })
    attempts: number

    @Column({ name: TbSrmBillingOutboxColumn.LAST_ERROR, type: 'varchar', length: 512, nullable: true, comment: '最近一次发布失败原因' })
    lastError: string

    @DateWithColumn(Column, {
        name: TbSrmBillingOutboxColumn.PUBLISHED_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '发布到 MQ 的时间'
    })
    publishedTime: Date
}
