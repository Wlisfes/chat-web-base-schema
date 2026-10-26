import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator'
import { BigintNumberTransformer, DataBaseAdapter, DataBaseDto, DateWithColumn, defineEnumMetadata } from '@/utils'
import { IsDateCustomize } from '@/decorator/common.decorator'
import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export enum TbSrmSimbankMessageColumn {
    KEY_ID = 'key_id',
    MSG_ID = 'msg_id',
    SOURCE = 'source',
    TYPE = 'type',
    FROM_NUMBER = 'from_number',
    TO_NUMBER = 'to_number',
    CONTENT = 'content',
    ENCODING = 'encoding',
    CONTENT_LENGTH = 'content_length',
    SEGMENTS = 'segments',
    COUNTRY_KEY_ID = 'country_key_id',
    MCC = 'mcc',
    SEND_STATUS = 'send_status',
    SEND_TIME = 'send_time',
    STATUS_CODE = 'status_code',
    STATUS_MESSAGE = 'status_message',
    CHANNEL_KEY_ID = 'channel_key_id',
    CHANNEL_ALIAS = 'channel_alias',
    CHANNEL_OWNER_USER_UID = 'channel_owner_user_uid',
    SIMBANK_KEY_ID = 'simbank_key_id',
    SIMBANK_NAME = 'simbank_name',
    SIMBANK_ALIAS = 'simbank_alias',
    USER_KEY_ID = 'user_key_id',
    USER_NAME = 'user_name',
    USER_ALIAS = 'user_alias',
    OWNER_USER_UID = 'owner_user_uid',
    PORT_KEY_ID = 'port_key_id',
    PORT = 'port',
    SIM = 'sim',
    ICCID = 'iccid',
    COST = 'cost',
    PRICE = 'price',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSrmSimbankMessageSource {
    DOWN = 'down',
    UP = 'up'
}

export const TbSrmSimbankMessageSourceDefinition = defineEnumMetadata(TbSrmSimbankMessageSource, '上下行', {
    [TbSrmSimbankMessageSource.UP]: { label: '上行', description: '设备接收的短信', type: 'info' },
    [TbSrmSimbankMessageSource.DOWN]: { label: '下行', description: '设备发出的短信', type: 'success' }
})

export enum TbSrmSimbankMessageType {
    MRKT = 'MRKT',
    NTFY = 'NTFY',
    SOTP = 'SOTP'
}

export const TbSrmSimbankMessageTypeDefinition = defineEnumMetadata(TbSrmSimbankMessageType, '短信类型', {
    [TbSrmSimbankMessageType.MRKT]: { label: '营销短信', description: '用于营销推广内容', type: 'orange' },
    [TbSrmSimbankMessageType.NTFY]: { label: '通知短信', description: '用于业务通知内容', type: 'info' },
    [TbSrmSimbankMessageType.SOTP]: { label: '验证码', description: '用于一次性验证码', type: 'success' }
})

export enum TbSrmSimbankMessageEncoding {
    GSM7 = 'GSM7',
    UCS2 = 'UCS2'
}

export const TbSrmSimbankMessageEncodingDefinition = defineEnumMetadata(TbSrmSimbankMessageEncoding, '编码方式', {
    [TbSrmSimbankMessageEncoding.GSM7]: { label: 'GSM7', description: '纯英文、数字和常用符号', type: 'info' },
    [TbSrmSimbankMessageEncoding.UCS2]: { label: 'UCS2', description: '包含中文、emoji 等非 GSM7 字符', type: 'warning' }
})

export enum TbSrmSimbankMessageSendStatus {
    DELIVERED = 'delivered',
    FAILED = 'failed',
    REJECTED = 'rejected',
    SUBMITTED = 'submitted',
    SUCCESS = 'success',
    UNKNOWN = 'unknown'
}

export const TbSrmSimbankMessageSendStatusDefinition = defineEnumMetadata(TbSrmSimbankMessageSendStatus, '发送状态', {
    [TbSrmSimbankMessageSendStatus.SUBMITTED]: { label: '提交成功', description: '短信已提交到设备，等待设备发送', type: 'warning' },
    [TbSrmSimbankMessageSendStatus.REJECTED]: { label: '提交失败', description: '短信未能提交到设备', type: 'error' },
    [TbSrmSimbankMessageSendStatus.SUCCESS]: { label: '发送成功', description: '设备已发出短信，等待送达回执', type: 'info' },
    [TbSrmSimbankMessageSendStatus.FAILED]: { label: '发送失败', description: '设备发送短信失败', type: 'error' },
    [TbSrmSimbankMessageSendStatus.DELIVERED]: { label: '已送达', description: '短信已送达接收号码', type: 'success' },
    [TbSrmSimbankMessageSendStatus.UNKNOWN]: { label: '未知', description: '未获取到明确的发送结果', type: 'default' }
})

export class TbSrmSimbankMessageDto extends DataBaseDto {
    @ApiProperty({
        description: '短信ID：SMS 提交时生成，同一条短信重投时保持不变',
        example: 'c2f45ce1-30a5-4d14-b0d7-cb76b10f0e21',
        required: false
    })
    @IsOptional()
    @IsString({ message: '短信ID必须是字符串' })
    @MaxLength(36, { message: '短信ID长度不能超过36位' })
    msgId: string

    @ApiProperty({
        description: TbSrmSimbankMessageSourceDefinition.comment,
        enum: TbSrmSimbankMessageSource,
        enumName: 'TbSrmSimbankMessageSource',
        example: TbSrmSimbankMessageSource.DOWN
    })
    @IsEnum(TbSrmSimbankMessageSource, { message: '上下行格式错误' })
    source: TbSrmSimbankMessageSource

    @ApiProperty({
        description: TbSrmSimbankMessageTypeDefinition.comment,
        enum: TbSrmSimbankMessageType,
        enumName: 'TbSrmSimbankMessageType',
        example: TbSrmSimbankMessageType.NTFY,
        required: false
    })
    @IsOptional()
    @IsEnum(TbSrmSimbankMessageType, { message: '短信类型格式错误' })
    type: TbSrmSimbankMessageType

    @ApiProperty({ description: '发送号码', example: '+8613800000000' })
    @IsString({ message: '发送号码必须是字符串' })
    @IsNotEmpty({ message: '发送号码必填' })
    @MaxLength(32, { message: '发送号码长度不能超过32位' })
    fromNumber: string

    @ApiProperty({ description: '接收号码', example: '+8613900000000' })
    @IsString({ message: '接收号码必须是字符串' })
    @IsNotEmpty({ message: '接收号码必填' })
    @MaxLength(32, { message: '接收号码长度不能超过32位' })
    toNumber: string

    @ApiProperty({ description: '短信内容', example: '您的验证码是 123456' })
    @IsString({ message: '短信内容必须是字符串' })
    @IsNotEmpty({ message: '短信内容必填' })
    content: string

    @ApiProperty({
        description: TbSrmSimbankMessageEncodingDefinition.comment,
        enum: TbSrmSimbankMessageEncoding,
        enumName: 'TbSrmSimbankMessageEncoding',
        example: TbSrmSimbankMessageEncoding.GSM7,
        required: false
    })
    @IsOptional()
    @IsEnum(TbSrmSimbankMessageEncoding, { message: '编码方式格式错误' })
    encoding: TbSrmSimbankMessageEncoding

    @ApiProperty({ description: '内容字符数：短信内容按编码计算的字符数', example: 18, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: '内容字符数必须是整数' })
    @Min(0, { message: '内容字符数不能小于0' })
    contentLength: number

    @ApiProperty({
        description: '计费条数：长短信按拆分后的段数计费，GSM7 单条160字符/每段153字符，UCS2 单条70字符/每段67字符',
        example: 1
    })
    @Type(() => Number)
    @IsInt({ message: '计费条数必须是整数' })
    @Min(1, { message: '计费条数不能小于1' })
    @Max(65535, { message: '计费条数不能大于65535' })
    segments: number

    @ApiProperty({ description: '国家/地区：Finance 国家/地区主键，对方号码所在国家/地区', example: 1024, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: '国家/地区必须是整数' })
    @Min(1, { message: '国家/地区必须大于0' })
    countryKeyId: number

    @ApiProperty({ description: 'MCC快照：对方号码所在国家/地区的移动国家代码', example: '460', required: false })
    @IsOptional()
    @IsString({ message: 'MCC 必须是字符串' })
    @MaxLength(4, { message: 'MCC 长度不能超过4位' })
    mcc: string

    @ApiProperty({
        description: TbSrmSimbankMessageSendStatusDefinition.comment,
        enum: TbSrmSimbankMessageSendStatus,
        enumName: 'TbSrmSimbankMessageSendStatus',
        example: TbSrmSimbankMessageSendStatus.SUBMITTED,
        required: false
    })
    @IsOptional()
    @IsEnum(TbSrmSimbankMessageSendStatus, { message: '发送状态格式错误' })
    sendStatus: TbSrmSimbankMessageSendStatus

    @ApiProperty({ description: '发送状态时间：发送状态变更时同步更新', example: '2026-10-19 12:00:05', required: false })
    @IsOptional()
    @IsDateCustomize({ message: '发送状态时间格式错误' })
    sendTime: Date

    @ApiProperty({ description: '状态码：设备返回的发送状态码', example: '0', required: false })
    @IsOptional()
    @IsString({ message: '状态码必须是字符串' })
    @MaxLength(32, { message: '状态码长度不能超过32位' })
    statusCode: string

    @ApiProperty({ description: '状态说明：设备返回的状态描述', example: '发送成功', required: false })
    @IsOptional()
    @IsString({ message: '状态说明必须是字符串' })
    @MaxLength(512, { message: '状态说明长度不能超过512位' })
    statusMessage: string

    @ApiProperty({ description: '通道ID：发送时使用的通道主键', example: 1001, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: '通道ID必须是整数' })
    @Min(1, { message: '通道ID必须大于0' })
    channelKeyId: number

    @ApiProperty({ description: '通道别名快照', example: '1024-460-MRKT-01', required: false })
    @IsOptional()
    @IsString({ message: '通道别名必须是字符串' })
    @MaxLength(32, { message: '通道别名长度不能超过32位' })
    channelAlias: string

    @ApiProperty({
        description: '通道负责人账号UID快照：发送时通道的负责人，用于按负责人统计业绩',
        example: '2149446185344106496',
        required: false
    })
    @IsOptional()
    @IsString({ message: '通道负责人账号UID必须是字符串' })
    @Length(1, 19, { message: '通道负责人账号UID长度不能超过19位' })
    channelOwnerUserUid: string

    @ApiProperty({ description: '设备ID：SRM SIMBANK 设备主键', example: 100201 })
    @Type(() => Number)
    @IsInt({ message: '设备ID必须是整数' })
    @Min(1, { message: '设备ID必须大于0' })
    simbankKeyId: number

    @ApiProperty({ description: '设备名称快照', example: 'SIMBANK-01' })
    @IsString({ message: '设备名称必须是字符串' })
    @IsNotEmpty({ message: '设备名称必填' })
    @MaxLength(64, { message: '设备名称长度不能超过64位' })
    simbankName: string

    @ApiProperty({ description: '设备别名快照', example: 'SB-HK-01', required: false })
    @IsOptional()
    @IsString({ message: '设备别名必须是字符串' })
    @MaxLength(64, { message: '设备别名长度不能超过64位' })
    simbankAlias: string

    @ApiProperty({ description: '归属供应商ID：SRM 供应商主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '归属供应商ID必须是整数' })
    @Min(1, { message: '归属供应商ID必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '归属供应商名称快照', example: '测试供应商' })
    @IsString({ message: '归属供应商名称必须是字符串' })
    @IsNotEmpty({ message: '归属供应商名称必填' })
    @MaxLength(64, { message: '归属供应商名称长度不能超过64位' })
    userName: string

    @ApiProperty({ description: '归属供应商别名快照', example: 'SSK1233A7K9', required: false })
    @IsOptional()
    @IsString({ message: '归属供应商别名必须是字符串' })
    @MaxLength(64, { message: '归属供应商别名长度不能超过64位' })
    userAlias: string

    @ApiProperty({ description: '归属人账号UID快照', example: '2149446185344106496' })
    @IsString({ message: '归属人账号UID必须是字符串' })
    @Length(1, 19, { message: '归属人账号UID长度不能超过19位' })
    ownerUserUid: string

    @ApiProperty({ description: '端口ID：SRM SIMBANK 端口主键', example: 1002401 })
    @Type(() => Number)
    @IsInt({ message: '端口ID必须是整数' })
    @Min(1, { message: '端口ID必须大于0' })
    portKeyId: number

    @ApiProperty({ description: '端口编号快照', example: 1 })
    @Type(() => Number)
    @IsInt({ message: '端口编号必须是整数' })
    @Min(1, { message: '端口编号不能小于1' })
    @Max(65535, { message: '端口编号不能大于65535' })
    port: number

    @ApiProperty({ description: 'SIM 卡号码快照：发送时端口 SIM 卡号码', example: '+8613800000000', required: false })
    @IsOptional()
    @IsString({ message: 'SIM 卡号码必须是字符串' })
    @MaxLength(32, { message: 'SIM 卡号码长度不能超过32位' })
    sim: string

    @ApiProperty({ description: 'ICCID快照：发送时端口 SIM 卡唯一编号', example: '89860000000000000000', required: false })
    @IsOptional()
    @IsString({ message: 'ICCID 必须是字符串' })
    @MaxLength(22, { message: 'ICCID 长度不能超过22位' })
    iccid: string

    @ApiProperty({ description: '供应商成本：USD总额（放大百万倍存储）', example: 0 })
    cost: number

    @ApiProperty({ description: '客户售价：USD总额（放大百万倍存储）', example: 0 })
    price: number
}

@Index('uk_tb_srm_simbank_message_msg_id', ['msgId'], { unique: true })
@Index('idx_tb_srm_simbank_message_channel_create_time', ['channelKeyId', 'createTime'])
@Index('idx_tb_srm_simbank_message_simbank_create_time', ['simbankKeyId', 'createTime'])
@Index('idx_tb_srm_simbank_message_port_create_time', ['portKeyId', 'createTime'])
@Index('idx_tb_srm_simbank_message_user_create_time', ['userKeyId', 'createTime'])
@Index('idx_tb_srm_simbank_message_owner_create_time', ['ownerUserUid', 'createTime'])
@Index('idx_tb_srm_simbank_message_channel_owner_create_time', ['channelOwnerUserUid', 'createTime'])
@Index('idx_tb_srm_simbank_message_status_create_time', ['sendStatus', 'createTime'])
@Index('idx_tb_srm_simbank_message_country_create_time', ['countryKeyId', 'createTime'])
@Index('idx_tb_srm_simbank_message_from_number_create_time', ['fromNumber', 'createTime'])
@Index('idx_tb_srm_simbank_message_to_number_create_time', ['toNumber', 'createTime'])
@Index('idx_tb_srm_simbank_message_create_time', ['createTime'])
@Entity({ name: 'tb_srm_simbank_message', comment: 'SRM SIMBANK 短信历史表' })
export class TbSrmSimbankMessage extends DataBaseAdapter {
    @Column({
        name: TbSrmSimbankMessageColumn.MSG_ID,
        type: 'varchar',
        length: 36,
        nullable: true,
        comment: '短信ID：SMS 提交时生成，同一条短信重投时保持不变'
    })
    msgId: string

    @Column({
        name: TbSrmSimbankMessageColumn.SOURCE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSrmSimbankMessageSourceDefinition.comment
    })
    source: TbSrmSimbankMessageSource

    @Column({
        name: TbSrmSimbankMessageColumn.TYPE,
        type: 'varchar',
        length: 32,
        nullable: true,
        comment: TbSrmSimbankMessageTypeDefinition.comment
    })
    type: TbSrmSimbankMessageType

    @Column({ name: TbSrmSimbankMessageColumn.FROM_NUMBER, type: 'varchar', length: 32, nullable: false, comment: '发送号码' })
    fromNumber: string

    @Column({ name: TbSrmSimbankMessageColumn.TO_NUMBER, type: 'varchar', length: 32, nullable: false, comment: '接收号码' })
    toNumber: string

    @Column({ name: TbSrmSimbankMessageColumn.CONTENT, type: 'text', nullable: false, comment: '短信内容' })
    content: string

    @Column({
        name: TbSrmSimbankMessageColumn.ENCODING,
        type: 'varchar',
        length: 16,
        nullable: true,
        comment: TbSrmSimbankMessageEncodingDefinition.comment
    })
    encoding: TbSrmSimbankMessageEncoding

    @Column({
        name: TbSrmSimbankMessageColumn.CONTENT_LENGTH,
        type: 'int',
        nullable: true,
        comment: '内容字符数：短信内容按编码计算的字符数'
    })
    contentLength: number

    @Column({
        name: TbSrmSimbankMessageColumn.SEGMENTS,
        type: 'int',
        nullable: false,
        default: 1,
        comment: '计费条数：长短信按拆分后的段数计费，GSM7 单条160字符/每段153字符，UCS2 单条70字符/每段67字符'
    })
    segments: number

    @Column({
        name: TbSrmSimbankMessageColumn.COUNTRY_KEY_ID,
        type: 'int',
        nullable: true,
        comment: '国家/地区：Finance 国家/地区主键，对方号码所在国家/地区'
    })
    countryKeyId: number

    @Column({
        name: TbSrmSimbankMessageColumn.MCC,
        type: 'varchar',
        length: 4,
        nullable: true,
        comment: 'MCC快照：对方号码所在国家/地区的移动国家代码'
    })
    mcc: string

    @Column({
        name: TbSrmSimbankMessageColumn.SEND_STATUS,
        type: 'varchar',
        length: 32,
        nullable: true,
        comment: TbSrmSimbankMessageSendStatusDefinition.comment
    })
    sendStatus: TbSrmSimbankMessageSendStatus

    @DateWithColumn(Column, {
        name: TbSrmSimbankMessageColumn.SEND_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '发送状态时间：发送状态变更时同步更新'
    })
    sendTime: Date

    @Column({
        name: TbSrmSimbankMessageColumn.STATUS_CODE,
        type: 'varchar',
        length: 32,
        nullable: true,
        comment: '状态码：设备返回的发送状态码'
    })
    statusCode: string

    @Column({
        name: TbSrmSimbankMessageColumn.STATUS_MESSAGE,
        type: 'varchar',
        length: 512,
        nullable: true,
        comment: '状态说明：设备返回的状态描述'
    })
    statusMessage: string

    @Column({ name: TbSrmSimbankMessageColumn.CHANNEL_KEY_ID, type: 'int', nullable: true, comment: '通道ID：发送时使用的通道主键' })
    channelKeyId: number

    @Column({ name: TbSrmSimbankMessageColumn.CHANNEL_ALIAS, type: 'varchar', length: 32, nullable: true, comment: '通道别名快照' })
    channelAlias: string

    @Column({
        name: TbSrmSimbankMessageColumn.CHANNEL_OWNER_USER_UID,
        type: 'varchar',
        length: 19,
        nullable: true,
        comment: '通道负责人账号UID快照'
    })
    channelOwnerUserUid: string

    @Column({ name: TbSrmSimbankMessageColumn.SIMBANK_KEY_ID, type: 'int', nullable: false, comment: '设备ID：SRM SIMBANK 设备主键' })
    simbankKeyId: number

    @Column({ name: TbSrmSimbankMessageColumn.SIMBANK_NAME, type: 'varchar', length: 64, nullable: false, comment: '设备名称快照' })
    simbankName: string

    @Column({ name: TbSrmSimbankMessageColumn.SIMBANK_ALIAS, type: 'varchar', length: 64, nullable: true, comment: '设备别名快照' })
    simbankAlias: string

    @Column({ name: TbSrmSimbankMessageColumn.USER_KEY_ID, type: 'int', nullable: false, comment: '归属供应商ID：SRM 供应商主键' })
    userKeyId: number

    @Column({ name: TbSrmSimbankMessageColumn.USER_NAME, type: 'varchar', length: 64, nullable: false, comment: '归属供应商名称快照' })
    userName: string

    @Column({ name: TbSrmSimbankMessageColumn.USER_ALIAS, type: 'varchar', length: 64, nullable: true, comment: '归属供应商别名快照' })
    userAlias: string

    @Column({
        name: TbSrmSimbankMessageColumn.OWNER_USER_UID,
        type: 'varchar',
        length: 19,
        nullable: false,
        comment: '归属人账号UID快照'
    })
    ownerUserUid: string

    @Column({ name: TbSrmSimbankMessageColumn.PORT_KEY_ID, type: 'int', nullable: false, comment: '端口ID：SRM SIMBANK 端口主键' })
    portKeyId: number

    @Column({ name: TbSrmSimbankMessageColumn.PORT, type: 'int', nullable: false, comment: '端口编号快照' })
    port: number

    @Column({
        name: TbSrmSimbankMessageColumn.SIM,
        type: 'varchar',
        length: 32,
        nullable: true,
        comment: 'SIM 卡号码快照：发送时端口 SIM 卡号码'
    })
    sim: string

    @Column({
        name: TbSrmSimbankMessageColumn.ICCID,
        type: 'varchar',
        length: 22,
        nullable: true,
        comment: 'ICCID快照：发送时端口 SIM 卡唯一编号'
    })
    iccid: string

    @Column({
        name: TbSrmSimbankMessageColumn.COST,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '供应商成本：USD总额（放大百万倍存储）'
    })
    cost: number

    @Column({
        name: TbSrmSimbankMessageColumn.PRICE,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '客户售价：USD总额（放大百万倍存储）'
    })
    price: number
}
