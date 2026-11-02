import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { BigintNumberTransformer, DataBaseByAdapter, DataBaseByDto, DateWithColumn, defineEnumMetadata } from '@/utils'
import { IsDateCustomize } from '@/decorator/common.decorator'
import { TbSmsAppType, TbSmsAppTypeDefinition } from './tb_sms_app'

export enum TbSmsTaskColumn {
    KEY_ID = 'key_id',
    TASK_NAME = 'task_name',
    USER_KEY_ID = 'user_key_id',
    USER_NAME = 'user_name',
    USER_ALIAS = 'user_alias',
    APP_KEY_ID = 'app_key_id',
    APP_ID = 'app_id',
    APP_ALIAS = 'app_alias',
    TYPE = 'type',
    CONTENT = 'content',
    TEMPLATE_ID = 'template_id',
    CURRENCY = 'currency',
    PLAN_TIME = 'plan_time',
    START_TIME = 'start_time',
    END_TIME = 'end_time',
    STATUS = 'status',
    SOURCE = 'source',
    FILE_KEY = 'file_key',
    FILE_NAME = 'file_name',
    TOTAL_COUNT = 'total_count',
    SUCCESS_COUNT = 'success_count',
    FAIL_COUNT = 'fail_count',
    CANCEL_COUNT = 'cancel_count',
    CHARGE_COUNT = 'charge_count',
    AMOUNT = 'amount',
    REMARK = 'remark',
    CREATE_BY = 'create_by',
    MODIFY_BY = 'modify_by',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

export enum TbSmsTaskStatus {
    PENDING = 'pending',
    SENDING = 'sending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export const TbSmsTaskStatusDefinition = defineEnumMetadata(TbSmsTaskStatus, '短信任务状态', {
    [TbSmsTaskStatus.PENDING]: { label: '待发送', description: '等待计划时间或入队', type: 'warning' },
    [TbSmsTaskStatus.SENDING]: { label: '发送中', description: '发送记录正在提交', type: 'info' },
    [TbSmsTaskStatus.COMPLETED]: { label: '已完成', description: '成功、失败和取消条数已等于任务发送总数', type: 'success' },
    [TbSmsTaskStatus.FAILED]: { label: '失败', description: '文件解析失败或应用禁用等任务级失败', type: 'error' },
    [TbSmsTaskStatus.CANCELLED]: { label: '已取消', description: '人工取消，未发出的记录改为取消', type: 'default' }
})

export enum TbSmsTaskSource {
    WEB = 'web',
    API = 'api'
}

export const TbSmsTaskSourceDefinition = defineEnumMetadata(TbSmsTaskSource, '短信任务来源', {
    [TbSmsTaskSource.WEB]: { label: 'WEB', description: '客户在网页创建', type: 'info' },
    [TbSmsTaskSource.API]: { label: 'API', description: '调用提交接口创建', type: 'success' }
})

export class TbSmsTaskDto extends DataBaseByDto {
    @ApiProperty({ description: '任务名称', example: '验证码通知' })
    @IsString({ message: '任务名称必须是字符串' })
    @IsNotEmpty({ message: '任务名称必填' })
    @MaxLength(128, { message: '任务名称长度不能超过128位' })
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

    @ApiProperty({
        description: '短信内容模板：展开号码时复制到发送记录；每条内容不同时为空',
        required: false,
        example: '您的验证码是 123456'
    })
    @IsOptional()
    @IsString({ message: '短信内容必须是字符串' })
    @MaxLength(1000, { message: '短信内容长度不能超过1000位' })
    content: string

    @ApiProperty({ description: '短信模板ID快照', required: false, example: 'TPL1001' })
    @IsOptional()
    @IsString({ message: '短信模板ID必须是字符串' })
    @MaxLength(64, { message: '短信模板ID长度不能超过64位' })
    templateId: string

    @ApiProperty({ description: '报价币种：售价和任务金额使用该币种，同一任务不得跨币种', example: 'USD' })
    @IsString({ message: '报价币种必须是字符串' })
    @IsNotEmpty({ message: '报价币种必填' })
    @MaxLength(16, { message: '报价币种长度不能超过16位' })
    currency: string

    @ApiProperty({ description: '计划发送时间：为空表示立即发送', required: false, example: '2026-11-02 18:00:00' })
    @IsOptional()
    @IsDateCustomize({ message: '计划发送时间格式错误' })
    planTime: Date

    @ApiProperty({ description: '实际开始时间', required: false, example: '2026-11-02 18:00:01' })
    @IsOptional()
    @IsDateCustomize({ message: '实际开始时间格式错误' })
    startTime: Date

    @ApiProperty({ description: '实际结束时间', required: false, example: '2026-11-02 18:05:00' })
    @IsOptional()
    @IsDateCustomize({ message: '实际结束时间格式错误' })
    endTime: Date

    @ApiProperty({ description: TbSmsTaskStatusDefinition.comment, enum: TbSmsTaskStatus, enumName: 'TbSmsTaskStatus' })
    @IsEnum(TbSmsTaskStatus, { message: '短信任务状态格式错误' })
    status: TbSmsTaskStatus

    @ApiProperty({ description: TbSmsTaskSourceDefinition.comment, enum: TbSmsTaskSource, enumName: 'TbSmsTaskSource' })
    @IsEnum(TbSmsTaskSource, { message: '短信任务来源格式错误' })
    source: TbSmsTaskSource

    @ApiProperty({
        description: '号码文件对象键：号码不存任务行，文件展开后写入发送记录',
        required: false,
        example: 'sms/task/20261102/numbers.csv'
    })
    @IsOptional()
    @IsString({ message: '号码文件对象键必须是字符串' })
    @MaxLength(128, { message: '号码文件对象键长度不能超过128位' })
    fileKey: string

    @ApiProperty({ description: '号码文件名', required: false, example: 'numbers.csv' })
    @IsOptional()
    @IsString({ message: '号码文件名必须是字符串' })
    @MaxLength(255, { message: '号码文件名长度不能超过255位' })
    fileName: string

    @ApiProperty({ description: '任务发送总数', example: 100 })
    @IsInt({ message: '任务发送总数必须是整数' })
    @Min(0, { message: '任务发送总数不能小于0' })
    totalCount: number

    @ApiProperty({ description: '已成功条数：含发送成功和已送达', example: 0 })
    @IsInt({ message: '已成功条数必须是整数' })
    @Min(0, { message: '已成功条数不能小于0' })
    successCount: number

    @ApiProperty({ description: '已失败条数：含提交失败和发送失败', example: 0 })
    @IsInt({ message: '已失败条数必须是整数' })
    @Min(0, { message: '已失败条数不能小于0' })
    failCount: number

    @ApiProperty({ description: '已取消条数：任务取消且尚未提交到通道', example: 0 })
    @IsInt({ message: '已取消条数必须是整数' })
    @Min(0, { message: '已取消条数不能小于0' })
    cancelCount: number

    @ApiProperty({ description: '计费条数合计：各发送记录 segments 之和', example: 0 })
    @IsInt({ message: '计费条数合计必须是整数' })
    @Min(0, { message: '计费条数合计不能小于0' })
    chargeCount: number

    @ApiProperty({ description: '客户售价合计：报价币种金额，放大百万倍存储，等于各发送记录 price 之和', example: 0 })
    @IsInt({ message: '客户售价合计必须是整数' })
    @Min(0, { message: '客户售价合计不能小于0' })
    amount: number

    @ApiProperty({ description: '备注', required: false, example: '11月验证码补发' })
    @IsOptional()
    @IsString({ message: '备注必须是字符串' })
    @MaxLength(1024, { message: '备注长度不能超过1024位' })
    remark: string
}

@Index('idx_tb_sms_task_user_create_time', ['userKeyId', 'createTime'])
@Index('idx_tb_sms_task_app_create_time', ['appKeyId', 'createTime'])
@Index('idx_tb_sms_task_status_plan_time', ['status', 'planTime'])
@Index('idx_tb_sms_task_create_by', ['createBy'])
@Entity({ name: 'tb_sms_task', comment: 'SMS 短信任务表' })
export class TbSmsTask extends DataBaseByAdapter {
    @Column({ name: TbSmsTaskColumn.TASK_NAME, type: 'varchar', length: 128, nullable: false, comment: '任务名称' })
    taskName: string

    @Column({ name: TbSmsTaskColumn.USER_KEY_ID, type: 'int', nullable: false, comment: 'CRM 客户主键' })
    userKeyId: number

    @Column({ name: TbSmsTaskColumn.USER_NAME, type: 'varchar', length: 128, nullable: false, comment: '客户名称快照' })
    userName: string

    @Column({ name: TbSmsTaskColumn.USER_ALIAS, type: 'varchar', length: 64, nullable: true, comment: '客户别名快照' })
    userAlias: string

    @Column({ name: TbSmsTaskColumn.APP_KEY_ID, type: 'int', nullable: false, comment: 'SMS 短信应用主键' })
    appKeyId: number

    @Column({ name: TbSmsTaskColumn.APP_ID, type: 'varchar', length: 32, nullable: false, comment: '应用ID快照' })
    appId: string

    @Column({ name: TbSmsTaskColumn.APP_ALIAS, type: 'varchar', length: 64, nullable: false, comment: '应用别名快照' })
    appAlias: string

    @Column({ name: TbSmsTaskColumn.TYPE, type: 'varchar', length: 32, nullable: false, comment: TbSmsAppTypeDefinition.comment })
    type: TbSmsAppType

    @Column({
        name: TbSmsTaskColumn.CONTENT,
        type: 'varchar',
        length: 1000,
        nullable: true,
        comment: '短信内容模板：展开号码时复制到发送记录；每条内容不同时为空'
    })
    content: string

    @Column({ name: TbSmsTaskColumn.TEMPLATE_ID, type: 'varchar', length: 64, nullable: true, comment: '短信模板ID快照' })
    templateId: string

    @Column({
        name: TbSmsTaskColumn.CURRENCY,
        type: 'varchar',
        length: 16,
        nullable: false,
        comment: '报价币种：售价和任务金额使用该币种，同一任务不得跨币种'
    })
    currency: string

    @DateWithColumn(Column, {
        name: TbSmsTaskColumn.PLAN_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '计划发送时间：为空表示立即发送'
    })
    planTime: Date

    @DateWithColumn(Column, {
        name: TbSmsTaskColumn.START_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '实际开始时间'
    })
    startTime: Date

    @DateWithColumn(Column, {
        name: TbSmsTaskColumn.END_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '实际结束时间'
    })
    endTime: Date

    @Column({
        name: TbSmsTaskColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        default: TbSmsTaskStatus.PENDING,
        comment: TbSmsTaskStatusDefinition.comment
    })
    status: TbSmsTaskStatus

    @Column({
        name: TbSmsTaskColumn.SOURCE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbSmsTaskSourceDefinition.comment
    })
    source: TbSmsTaskSource

    @Column({
        name: TbSmsTaskColumn.FILE_KEY,
        type: 'varchar',
        length: 128,
        nullable: true,
        comment: '号码文件对象键：号码不存任务行，文件展开后写入发送记录'
    })
    fileKey: string

    @Column({ name: TbSmsTaskColumn.FILE_NAME, type: 'varchar', length: 255, nullable: true, comment: '号码文件名' })
    fileName: string

    @Column({ name: TbSmsTaskColumn.TOTAL_COUNT, type: 'int', nullable: false, default: 0, comment: '任务发送总条数' })
    totalCount: number

    @Column({ name: TbSmsTaskColumn.SUCCESS_COUNT, type: 'int', nullable: false, default: 0, comment: '已成功条数：含发送成功和已送达' })
    successCount: number

    @Column({ name: TbSmsTaskColumn.FAIL_COUNT, type: 'int', nullable: false, default: 0, comment: '已失败条数：含提交失败和发送失败' })
    failCount: number

    @Column({
        name: TbSmsTaskColumn.CANCEL_COUNT,
        type: 'int',
        nullable: false,
        default: 0,
        comment: '已取消条数：任务取消且尚未提交到通道'
    })
    cancelCount: number

    @Column({
        name: TbSmsTaskColumn.CHARGE_COUNT,
        type: 'int',
        nullable: false,
        default: 0,
        comment: '计费条数合计：各发送记录 segments 之和'
    })
    chargeCount: number

    @Column({
        name: TbSmsTaskColumn.AMOUNT,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '客户售价合计：报价币种金额，放大百万倍存储，等于各发送记录 price 之和'
    })
    amount: number

    @Column({ name: TbSmsTaskColumn.REMARK, type: 'varchar', length: 1024, nullable: true, comment: '备注' })
    remark: string
}
