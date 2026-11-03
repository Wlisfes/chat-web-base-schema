import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { BigintNumberTransformer, DataBaseAdapter, DataBaseDto, DateWithColumn, defineEnumMetadata } from '@/utils'
import { IsDateCustomize } from '@/decorator/common.decorator'
import { TbSmsAppType, TbSmsAppTypeDefinition } from './tb_sms_app'

export enum TbSmsMessageColumn {
    KEY_ID = 'key_id',
    MSG_ID = 'msg_id',
    TASK_KEY_ID = 'task_key_id',
    TASK_NAME = 'task_name',
    USER_KEY_ID = 'user_key_id',
    USER_NAME = 'user_name',
    USER_ALIAS = 'user_alias',
    APP_KEY_ID = 'app_key_id',
    APP_ID = 'app_id',
    APP_ALIAS = 'app_alias',
    TYPE = 'type',
    TEMPLATE_ID = 'template_id',
    COUNTRY_KEY_ID = 'country_key_id',
    MCC = 'mcc',
    TO_NUMBER = 'to_number',
    CONTENT = 'content',
    ENCODING = 'encoding',
    CONTENT_LENGTH = 'content_length',
    SEGMENTS = 'segments',
    CURRENCY = 'currency',
    PRICE = 'price',
    SUBMIT_TIME = 'submit_time',
    SEND_STATUS = 'send_status',
    SEND_TIME = 'send_time',
    STATUS_CODE = 'status_code',
    STATUS_MESSAGE = 'status_message',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSmsMessageEncoding {
    GSM7 = 'GSM7',
    UCS2 = 'UCS2'
}

export const TbSmsMessageEncodingDefinition = defineEnumMetadata(TbSmsMessageEncoding, '编码方式', {
    [TbSmsMessageEncoding.GSM7]: { label: 'GSM7', description: '纯英文、数字和常用符号', type: 'info' },
    [TbSmsMessageEncoding.UCS2]: { label: 'UCS2', description: '包含中文、emoji 等非 GSM7 字符', type: 'warning' }
})

export enum TbSmsMessageSendStatus {
    PENDING = 'pending',
    QUEUED = 'queued',
    SUBMITTED = 'submitted',
    REJECTED = 'rejected',
    SUCCESS = 'success',
    FAILED = 'failed',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export const TbSmsMessageSendStatusDefinition = defineEnumMetadata(TbSmsMessageSendStatus, '短信发送状态', {
    [TbSmsMessageSendStatus.PENDING]: { label: '待提交', description: '已落库，尚未进入提交队列', type: 'default' },
    [TbSmsMessageSendStatus.QUEUED]: { label: '已入队', description: '已进入提交队列', type: 'warning' },
    [TbSmsMessageSendStatus.SUBMITTED]: { label: '提交成功', description: '短信已提交到设备，等待设备发送', type: 'info' },
    [TbSmsMessageSendStatus.REJECTED]: { label: '提交失败', description: '短信未能提交到设备', type: 'error' },
    [TbSmsMessageSendStatus.SUCCESS]: { label: '发送成功', description: '设备已发出短信，等待送达回执', type: 'info' },
    [TbSmsMessageSendStatus.FAILED]: { label: '发送失败', description: '设备发送短信失败', type: 'error' },
    [TbSmsMessageSendStatus.DELIVERED]: { label: '已送达', description: '短信已送达接收号码', type: 'success' },
    [TbSmsMessageSendStatus.CANCELLED]: { label: '已取消', description: '任务取消且尚未提交到通道', type: 'default' }
})

export class TbSmsMessageDto extends DataBaseDto {
    @ApiProperty({ description: '短信ID：提交时生成的雪花ID，重投保持不变', example: '1987654321098765432' })
    @IsString({ message: '短信ID必须是字符串' })
    @IsNotEmpty({ message: '短信ID必填' })
    @MaxLength(36, { message: '短信ID长度不能超过36位' })
    msgId: string

    @ApiProperty({ description: '短信任务主键：单条提交不挂任务时为空', required: false, example: 1 })
    @IsOptional()
    @IsInt({ message: '短信任务主键必须是整数' })
    @Min(1, { message: '短信任务主键必须大于0' })
    taskKeyId: number

    @ApiProperty({ description: '短信任务名称快照', required: false, example: '验证码通知' })
    @IsOptional()
    @IsString({ message: '短信任务名称必须是字符串' })
    @MaxLength(128, { message: '短信任务名称长度不能超过128位' })
    taskName: string

    @ApiProperty({ description: 'CRM 客户主键', example: 10241010 })
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '客户名称快照', example: '青萍科技股份有限公司' })
    @IsString({ message: '客户名称必须是字符串' })
    @IsNotEmpty({ message: '客户名称必填' })
    @MaxLength(128, { message: '客户名称长度不能超过128位' })
    userName: string

    @ApiProperty({ description: '客户别名快照', required: false, example: '青萍科技' })
    @IsOptional()
    @IsString({ message: '客户别名必须是字符串' })
    @MaxLength(64, { message: '客户别名长度不能超过64位' })
    userAlias: string

    @ApiProperty({ description: 'SMS 短信应用主键', example: 1002009 })
    @IsInt({ message: '短信应用主键必须是整数' })
    @Min(1, { message: '短信应用主键必须大于0' })
    appKeyId: number

    @ApiProperty({ description: '应用ID快照', example: 'NwlP460poQnWw1F9' })
    @IsString({ message: '应用ID必须是字符串' })
    @IsNotEmpty({ message: '应用ID必填' })
    @MaxLength(32, { message: '应用ID长度不能超过32位' })
    appId: string

    @ApiProperty({ description: '应用别名快照', example: 'CSK1233SOTPA001' })
    @IsString({ message: '应用别名必须是字符串' })
    @IsNotEmpty({ message: '应用别名必填' })
    @MaxLength(64, { message: '应用别名长度不能超过64位' })
    appAlias: string

    @ApiProperty({ description: TbSmsAppTypeDefinition.comment, enum: TbSmsAppType, enumName: 'TbSmsAppType' })
    @IsEnum(TbSmsAppType, { message: '短信类型格式错误' })
    type: TbSmsAppType

    @ApiProperty({ description: '短信模板ID快照', required: false, example: 'TPL1001' })
    @IsOptional()
    @IsString({ message: '短信模板ID必须是字符串' })
    @MaxLength(64, { message: '短信模板ID长度不能超过64位' })
    templateId: string

    @ApiProperty({ description: 'Finance 国家/地区主键', example: 1077 })
    @IsInt({ message: '国家/地区主键必须是整数' })
    @Min(1, { message: '国家/地区主键必须大于0' })
    countryKeyId: number

    @ApiProperty({ description: '移动国家代码', example: '460' })
    @IsString({ message: '移动国家代码必须是字符串' })
    @IsNotEmpty({ message: '移动国家代码必填' })
    @MaxLength(4, { message: '移动国家代码长度不能超过4位' })
    mcc: string

    @ApiProperty({ description: '接收号码：含国际区号，不带 + 号', example: '8613800138000' })
    @IsString({ message: '接收号码必须是字符串' })
    @IsNotEmpty({ message: '接收号码必填' })
    @MaxLength(32, { message: '接收号码长度不能超过32位' })
    toNumber: string

    @ApiProperty({ description: '实际发送内容', example: '您的验证码是 123456' })
    @IsString({ message: '短信内容必须是字符串' })
    @IsNotEmpty({ message: '短信内容必填' })
    @MaxLength(1000, { message: '短信内容长度不能超过1000位' })
    content: string

    @ApiProperty({ description: TbSmsMessageEncodingDefinition.comment, enum: TbSmsMessageEncoding, enumName: 'TbSmsMessageEncoding' })
    @IsEnum(TbSmsMessageEncoding, { message: '编码方式格式错误' })
    encoding: TbSmsMessageEncoding

    @ApiProperty({ description: '内容字符数：短信内容按编码计算的字符数', example: 12 })
    @IsInt({ message: '内容字符数必须是整数' })
    @Min(1, { message: '内容字符数必须大于0' })
    contentLength: number

    @ApiProperty({ description: '计费条数：GSM7 单条160/每段153，UCS2 单条70/每段67', example: 1 })
    @IsInt({ message: '计费条数必须是整数' })
    @Min(1, { message: '计费条数必须大于0' })
    segments: number

    @ApiProperty({ description: '报价币种：与所属任务一致；单条提交取生效报价币种', example: 'USD' })
    @IsString({ message: '报价币种必须是字符串' })
    @IsNotEmpty({ message: '报价币种必填' })
    @MaxLength(16, { message: '报价币种长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '客户售价：报价币种金额，放大百万倍存储，等于生效报价 down_local 乘以计费条数', example: 50000 })
    @IsInt({ message: '客户售价必须是整数' })
    @Min(0, { message: '客户售价不能小于0' })
    price: number

    @ApiProperty({ description: '提交时间', example: '2026-11-02 18:00:01' })
    @IsDateCustomize({ message: '提交时间格式错误' })
    submitTime: Date

    @ApiProperty({
        description: TbSmsMessageSendStatusDefinition.comment,
        enum: TbSmsMessageSendStatus,
        enumName: 'TbSmsMessageSendStatus'
    })
    @IsEnum(TbSmsMessageSendStatus, { message: '短信发送状态格式错误' })
    sendStatus: TbSmsMessageSendStatus

    @ApiProperty({ description: '发送状态时间：发送状态变更时同步更新', required: false, example: '2026-11-02 18:00:05' })
    @IsOptional()
    @IsDateCustomize({ message: '发送状态时间格式错误' })
    sendTime: Date

    @ApiProperty({ description: '状态码：通道或设备返回的发送状态码', required: false, example: '0' })
    @IsOptional()
    @IsString({ message: '状态码必须是字符串' })
    @MaxLength(32, { message: '状态码长度不能超过32位' })
    statusCode: string

    @ApiProperty({ description: '状态说明：通道或设备返回的状态描述', required: false, example: '发送成功' })
    @IsOptional()
    @IsString({ message: '状态说明必须是字符串' })
    @MaxLength(512, { message: '状态说明长度不能超过512位' })
    statusMessage: string
}

@Index('uk_tb_sms_message_msg_id', ['msgId'], { unique: true })
@Index('idx_tb_sms_message_task_create_time', ['taskKeyId', 'createTime'])
@Index('idx_tb_sms_message_user_create_time', ['userKeyId', 'createTime'])
@Index('idx_tb_sms_message_app_create_time', ['appKeyId', 'createTime'])
@Index('idx_tb_sms_message_status_create_time', ['sendStatus', 'createTime'])
@Index('idx_tb_sms_message_to_number_create_time', ['toNumber', 'createTime'])
@Index('idx_tb_sms_message_create_time', ['createTime'])
@Entity({ name: 'tb_sms_message', comment: 'SMS 短信发送记录表' })
export class TbSmsMessage extends DataBaseAdapter {
    @Column({
        name: TbSmsMessageColumn.MSG_ID,
        type: 'varchar',
        length: 36,
        nullable: false,
        comment: '短信ID：提交时生成的雪花ID，重投保持不变'
    })
    msgId: string

    @Column({ name: TbSmsMessageColumn.TASK_KEY_ID, type: 'int', nullable: true, comment: '短信任务主键：单条提交不挂任务时为空' })
    taskKeyId: number

    @Column({ name: TbSmsMessageColumn.TASK_NAME, type: 'varchar', length: 128, nullable: true, comment: '短信任务名称快照' })
    taskName: string

    @Column({ name: TbSmsMessageColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'CRM 客户主键' })
    userKeyId: number

    @Column({ name: TbSmsMessageColumn.USER_NAME, type: 'varchar', length: 128, nullable: false, comment: '客户名称快照' })
    userName: string

    @Column({ name: TbSmsMessageColumn.USER_ALIAS, type: 'varchar', length: 64, nullable: true, comment: '客户别名快照' })
    userAlias: string

    @Column({ name: TbSmsMessageColumn.APP_KEY_ID, type: 'int', nullable: false, comment: 'SMS 短信应用主键' })
    appKeyId: number

    @Column({ name: TbSmsMessageColumn.APP_ID, type: 'varchar', length: 32, nullable: false, comment: '应用ID快照' })
    appId: string

    @Column({ name: TbSmsMessageColumn.APP_ALIAS, type: 'varchar', length: 64, nullable: false, comment: '应用别名快照' })
    appAlias: string

    @Column({ name: TbSmsMessageColumn.TYPE, type: 'varchar', length: 32, nullable: false, comment: TbSmsAppTypeDefinition.comment })
    type: TbSmsAppType

    @Column({ name: TbSmsMessageColumn.TEMPLATE_ID, type: 'varchar', length: 64, nullable: true, comment: '短信模板ID快照' })
    templateId: string

    @Column({ name: TbSmsMessageColumn.COUNTRY_KEY_ID, type: 'int', nullable: false, comment: 'Finance 国家/地区主键' })
    countryKeyId: number

    @Column({ name: TbSmsMessageColumn.MCC, type: 'varchar', length: 4, nullable: false, comment: '移动国家代码' })
    mcc: string

    @Column({
        name: TbSmsMessageColumn.TO_NUMBER,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: '接收号码：含国际区号，不带 + 号'
    })
    toNumber: string

    @Column({ name: TbSmsMessageColumn.CONTENT, type: 'varchar', length: 1000, nullable: false, comment: '实际发送内容' })
    content: string

    @Column({
        name: TbSmsMessageColumn.ENCODING,
        type: 'varchar',
        length: 16,
        nullable: false,
        comment: TbSmsMessageEncodingDefinition.comment
    })
    encoding: TbSmsMessageEncoding

    @Column({ name: TbSmsMessageColumn.CONTENT_LENGTH, type: 'int', nullable: false, comment: '内容字符数：短信内容按编码计算的字符数' })
    contentLength: number

    @Column({
        name: TbSmsMessageColumn.SEGMENTS,
        type: 'int',
        nullable: false,
        comment: '计费条数：GSM7 单条160/每段153，UCS2 单条70/每段67'
    })
    segments: number

    @Column({
        name: TbSmsMessageColumn.CURRENCY,
        type: 'varchar',
        length: 16,
        nullable: false,
        comment: '报价币种：与所属任务一致；单条提交取生效报价币种'
    })
    currency: string

    @Column({
        name: TbSmsMessageColumn.PRICE,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '客户售价：报价币种金额，放大百万倍存储，等于生效报价 down_local 乘以计费条数'
    })
    price: number

    @DateWithColumn(Column, {
        name: TbSmsMessageColumn.SUBMIT_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '提交时间'
    })
    submitTime: Date

    @Column({
        name: TbSmsMessageColumn.SEND_STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSmsMessageSendStatus.PENDING,
        comment: TbSmsMessageSendStatusDefinition.comment
    })
    sendStatus: TbSmsMessageSendStatus

    @DateWithColumn(Column, {
        name: TbSmsMessageColumn.SEND_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '发送状态时间：发送状态变更时同步更新'
    })
    sendTime: Date

    @Column({
        name: TbSmsMessageColumn.STATUS_CODE,
        type: 'varchar',
        length: 32,
        nullable: true,
        comment: '状态码：通道或设备返回的发送状态码'
    })
    statusCode: string

    @Column({
        name: TbSmsMessageColumn.STATUS_MESSAGE,
        type: 'varchar',
        length: 512,
        nullable: true,
        comment: '状态说明：通道或设备返回的状态描述'
    })
    statusMessage: string
}
