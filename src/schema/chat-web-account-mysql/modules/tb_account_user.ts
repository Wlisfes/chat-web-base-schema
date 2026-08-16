import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsEmail, IsEnum, IsMobilePhone, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator'
import { DataBaseAdapter, DataBaseDto, DateWithColumn, defineEnumMetadata } from '@/utils'

/** tb_account_user 的数据库字段名。 */
export enum TbAccountUserColumn {
    KEY_ID = 'key_id',
    UID = 'uid',
    NUMBER = 'number',
    PHONE = 'phone',
    EMAIL = 'email',
    NAME = 'name',
    AVATAR = 'avatar',
    STATUS = 'status',
    EMPLOYMENT_STATUS = 'employment_status',
    PASSWORD = 'password',
    LAST_LOGIN_TIME = 'last_login_time',
    EMPLOYMENT_TIME = 'employment_time',
    RESIGNATION_TIME = 'resignation_time',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 账号状态；外部建表 SQL 中的值需要与此枚举保持一致。 */
export enum TbAccountUserStatus {
    DISABLED = 'disabled',
    ENABLED = 'enabled'
}

/** 账号状态的中文元数据、选项及字段说明。 */
export const TbAccountUserStatusDefinition = defineEnumMetadata(TbAccountUserStatus, '账号状态', {
    [TbAccountUserStatus.DISABLED]: {
        label: '禁用',
        description: '账号不可登录'
    },
    [TbAccountUserStatus.ENABLED]: {
        label: '启用',
        description: '账号可以正常登录'
    }
})

export const {
    metadata: TbAccountUserStatusMetadata,
    options: TbAccountUserStatusOptions,
    count: TbAccountUserStatusCount,
    comment: TbAccountUserStatusComment
} = TbAccountUserStatusDefinition

/** 员工在职状态；与账号能否登录的状态相互独立。 */
export enum TbAccountUserEmploymentStatus {
    EMPLOYED = 'employed',
    RESIGNED = 'resigned'
}

/** 员工在职状态的中文元数据、选项及字段说明。 */
export const TbAccountUserEmploymentStatusDefinition = defineEnumMetadata(TbAccountUserEmploymentStatus, '员工状态', {
    [TbAccountUserEmploymentStatus.EMPLOYED]: {
        label: '在职',
        description: '员工当前处于在职状态'
    },
    [TbAccountUserEmploymentStatus.RESIGNED]: {
        label: '离职',
        description: '员工已经离职'
    }
})

export const {
    metadata: TbAccountUserEmploymentStatusMetadata,
    options: TbAccountUserEmploymentStatusOptions,
    count: TbAccountUserEmploymentStatusCount,
    comment: TbAccountUserEmploymentStatusComment
} = TbAccountUserEmploymentStatusDefinition

/**
 * tb_account_user 的完整字段 DTO。
 * 接口 DTO 可通过 PickType、OmitType、PartialType 从这里派生。
 */
export class TbAccountUserDto extends DataBaseDto {
    @ApiProperty({ description: '账号UID', example: '2149446185344106496' })
    @IsString({ message: '账号UID必须是字符串' })
    @IsNotEmpty({ message: '账号UID必填' })
    @Length(1, 19, { message: '账号UID长度不能超过19位' })
    uid: string

    @ApiProperty({ description: '工号', example: '1234' })
    @IsString({ message: '工号必须是字符串' })
    @IsNotEmpty({ message: '工号必填' })
    @Length(4, 4, { message: '工号必须保持4位' })
    number: string

    @ApiProperty({ description: '手机号', example: '18888888888' })
    @IsString({ message: '手机号必须是字符串' })
    @IsNotEmpty({ message: '手机号必填' })
    @IsMobilePhone('zh-CN', { strictMode: false }, { message: '手机号格式错误' })
    phone: string

    @ApiProperty({ description: '邮箱', example: 'user@example.com', required: false })
    @IsOptional()
    @IsEmail({}, { message: '邮箱格式错误' })
    @MaxLength(128, { message: '邮箱长度不能超过128位' })
    email: string

    @ApiProperty({ description: '姓名', example: '张三' })
    @IsString({ message: '姓名必须是字符串' })
    @IsNotEmpty({ message: '姓名必填' })
    @Length(2, 32, { message: '姓名必须保持2~32位' })
    name: string

    @ApiProperty({ description: '头像地址', example: 'https://picsum.photos/500', required: false })
    @IsOptional()
    @IsString({ message: '头像地址必须是字符串' })
    @MaxLength(255, { message: '头像地址长度不能超过255位' })
    avatar: string

    @ApiProperty({
        description: TbAccountUserStatusComment,
        enum: TbAccountUserStatus,
        enumName: 'TbAccountUserStatus',
        example: TbAccountUserStatus.ENABLED
    })
    @IsNotEmpty({ message: '账号状态必填' })
    @IsEnum(TbAccountUserStatus, { message: '账号状态格式错误' })
    status: TbAccountUserStatus

    @ApiProperty({
        description: TbAccountUserEmploymentStatusComment,
        enum: TbAccountUserEmploymentStatus,
        enumName: 'TbAccountUserEmploymentStatus',
        example: TbAccountUserEmploymentStatus.EMPLOYED
    })
    @IsNotEmpty({ message: '员工状态必填' })
    @IsEnum(TbAccountUserEmploymentStatus, { message: '员工状态格式错误' })
    employmentStatus: TbAccountUserEmploymentStatus

    @ApiProperty({ description: '密码', example: 'Abc123456', writeOnly: true })
    @IsString({ message: '密码必须是字符串' })
    @IsNotEmpty({ message: '密码必填' })
    @Length(6, 32, { message: '密码必须保持6~32位' })
    password: string

    @ApiProperty({ description: '最后登录时间', example: '2026-08-16 12:00:00', required: false, readOnly: true })
    lastLoginTime: Date

    @ApiProperty({ description: '入职时间', example: '2026-08-16 09:00:00' })
    @Type(() => Date)
    @IsNotEmpty({ message: '入职时间必填' })
    @IsDate({ message: '入职时间格式错误' })
    employmentTime: Date

    @ApiProperty({ description: '离职时间', example: '2027-08-16 18:00:00', required: false })
    @Type(() => Date)
    @IsOptional()
    @IsDate({ message: '离职时间格式错误' })
    resignationTime: Date
}

@Index('uk_tb_account_user_uid', ['uid'], { unique: true })
@Index('uk_tb_account_user_number', ['number'], { unique: true })
@Index('uk_tb_account_user_phone', ['phone'], { unique: true })
@Entity({ name: 'tb_account_user', comment: '员工账号表' })
export class TbAccountUser extends DataBaseAdapter {
    @Column({
        name: TbAccountUserColumn.UID,
        type: 'varchar',
        comment: 'UID',
        update: false,
        length: 19,
        nullable: false
    })
    uid: string

    @Column({
        name: TbAccountUserColumn.NUMBER,
        type: 'varchar',
        comment: '工号',
        length: 32,
        nullable: false
    })
    number: string

    @Column({
        name: TbAccountUserColumn.PHONE,
        type: 'varchar',
        comment: '手机号',
        length: 32,
        nullable: false
    })
    phone: string

    @Column({
        name: TbAccountUserColumn.EMAIL,
        type: 'varchar',
        comment: '邮箱',
        length: 128,
        nullable: true
    })
    email: string

    @Column({
        name: TbAccountUserColumn.NAME,
        type: 'varchar',
        comment: '姓名',
        length: 32,
        nullable: false
    })
    name: string

    @Column({
        name: TbAccountUserColumn.AVATAR,
        type: 'varchar',
        comment: '头像',
        length: 255,
        nullable: true
    })
    avatar: string

    @Column({
        name: TbAccountUserColumn.STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbAccountUserStatusComment
    })
    status: TbAccountUserStatus

    @Column({
        name: TbAccountUserColumn.EMPLOYMENT_STATUS,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbAccountUserEmploymentStatusComment
    })
    employmentStatus: TbAccountUserEmploymentStatus

    @Column({
        name: TbAccountUserColumn.PASSWORD,
        type: 'varchar',
        length: 255,
        comment: '密码哈希',
        select: false,
        nullable: false
    })
    password: string

    @DateWithColumn(Column, {
        name: TbAccountUserColumn.LAST_LOGIN_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '最后登录时间'
    })
    lastLoginTime: Date

    @DateWithColumn(Column, {
        name: TbAccountUserColumn.EMPLOYMENT_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '入职时间'
    })
    employmentTime: Date

    @DateWithColumn(Column, {
        name: TbAccountUserColumn.RESIGNATION_TIME,
        type: 'datetime',
        precision: 3,
        nullable: true,
        comment: '离职时间'
    })
    resignationTime: Date
}
