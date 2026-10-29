require('reflect-metadata')

const { readFileSync, readdirSync } = require('node:fs')
const { basename, extname, resolve } = require('node:path')
const { getMetadataArgsStorage } = require('typeorm')
const financeSchema = require('../dist/src/schema/chat-web-finance-mysql')
const crmSchema = require('../dist/src/schema/chat-web-crm-mysql')
const srmSchema = require('../dist/src/schema/chat-web-srm-mysql')
const skylineSchema = require('../dist/src/schema/chat-web-skyline-mysql')
const taskSchema = require('../dist/src/schema/chat-web-task-mysql')
const smsSchema = require('../dist/src/schema/chat-web-sms-mysql')
const { DataBaseAdapter, DataBaseByAdapter } = require('../dist/src/utils')

function sorted(values) {
    return [...values].sort()
}

function assertEqualSet(label, actual, expected) {
    const actualValues = sorted(actual)
    const expectedValues = sorted(expected)

    if (JSON.stringify(actualValues) !== JSON.stringify(expectedValues)) {
        throw new Error(`${label} mismatch\nactual: ${actualValues.join(', ')}\nexpected: ${expectedValues.join(', ')}`)
    }
}

function fileBasenames(directory, extension) {
    return readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isFile() && extname(entry.name) === extension)
        .map(entry => basename(entry.name, extension))
}

function validateServiceFiles(serviceRoot) {
    const moduleNames = fileBasenames(resolve(serviceRoot, 'modules'), '.ts')
    const sqlNames = fileBasenames(resolve(serviceRoot, 'sql'), '.sql')
    assertEqualSet(`${basename(serviceRoot)} module/create SQL files`, moduleNames, sqlNames)

    const changeNames = fileBasenames(resolve(serviceRoot, 'sql/changes'), '.sql')
    const invalidChangeNames = changeNames.filter(name => !/^\d{14}__tb_[a-z0-9_]+__[a-z0-9_]+$/.test(name))

    if (invalidChangeNames.length) {
        throw new Error(`Invalid SQL change filenames: ${invalidChangeNames.join(', ')}`)
    }
}

/** 校验实体源码里的列名必须引用列名枚举，禁止硬编码字符串字面量。 */
function validateColumnEnumUsage(serviceRoot) {
    const directory = resolve(serviceRoot, 'modules')
    const failures = []

    for (const name of readdirSync(directory)) {
        if (!name.startsWith('tb_') || extname(name) !== '.ts') continue

        const source = readFileSync(resolve(directory, name), 'utf8')
        const entityIndex = source.search(/@Entity\(/)
        if (entityIndex < 0) {
            failures.push(`${name}: missing @Entity declaration`)
            continue
        }
        if (!/export enum Tb\w*Column \{/.test(source)) {
            failures.push(`${name}: missing Tb<Table>Column enum`)
            continue
        }

        const body = source.slice(entityIndex)
        const decorators = [...body.matchAll(/@(Column|WithJsonColumn|DateWithColumn|JoinColumn)\(([\s\S]*?)\)\s*\n/g)]

        for (const [, decorator, options] of decorators) {
            const literal = options.match(/name:\s*'([^']+)'/)
            if (literal) failures.push(`${name}: @${decorator} hardcodes name: '${literal[1]}', use the column enum instead`)
            else if (!/name:\s*(?:DataBaseColumn|Tb\w*Column)\./.test(options)) {
                failures.push(`${name}: @${decorator} is missing an enum-based name option`)
            }
        }
    }

    if (failures.length) {
        throw new Error(`${basename(serviceRoot)} column enum usage errors:\n  - ${failures.join('\n  - ')}`)
    }
}

function validateTable({ entity, dto, columns, sqlPath, enumComments = [] }) {
    const metadata = getMetadataArgsStorage()
    const inheritedTargets = [DataBaseAdapter]
    if (DataBaseByAdapter.prototype.isPrototypeOf(entity.prototype)) inheritedTargets.push(DataBaseByAdapter)
    const entityColumns = metadata.columns.filter(column => column.target === entity || inheritedTargets.includes(column.target))
    const databaseColumns = entityColumns.map(column => column.options.name || column.propertyName)
    const entityProperties = entityColumns.map(column => column.propertyName)
    const entityTable = metadata.tables.find(table => table.target === entity)
    const entityIndexes = metadata.indices.filter(index => index.target === entity && index.unique).map(index => index.name)
    const swaggerProperties = (Reflect.getMetadata('swagger/apiModelPropertiesArray', dto.prototype) || []).map(property =>
        property.slice(1)
    )
    const sql = readFileSync(sqlPath, 'utf8')
    const sqlTable = sql.match(/CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+`([^`]+)`/i)?.[1]
    const sqlColumns = [...sql.matchAll(/^\s*`([^`]+)`\s+/gm)].map(match => match[1])
    const sqlUniqueIndexes = [...sql.matchAll(/UNIQUE\s+(?:KEY|INDEX)\s+`([^`]+)`/gi)].map(match => match[1])

    assertEqualSet(`${entity.name} database column enum`, databaseColumns, Object.values(columns))
    assertEqualSet(`${entity.name} Swagger DTO`, swaggerProperties, entityProperties)
    assertEqualSet(`${entity.name} create SQL columns`, sqlColumns, Object.values(columns))
    assertEqualSet(`${entity.name} create SQL unique indexes`, sqlUniqueIndexes, entityIndexes)

    if (sqlTable !== entityTable?.name) {
        throw new Error(`${entity.name} table name mismatch: Entity=${entityTable?.name}, SQL=${sqlTable}`)
    }

    for (const comment of enumComments) {
        if (!sql.includes(comment)) {
            throw new Error(`${entity.name} create SQL is missing enum comment: ${comment}`)
        }
    }
}

const financeServiceRoot = resolve(__dirname, '../src/schema/chat-web-finance-mysql')
validateServiceFiles(financeServiceRoot)
validateColumnEnumUsage(financeServiceRoot)

const crmServiceRoot = resolve(__dirname, '../src/schema/chat-web-crm-mysql')
validateServiceFiles(crmServiceRoot)
validateColumnEnumUsage(crmServiceRoot)

const srmServiceRoot = resolve(__dirname, '../src/schema/chat-web-srm-mysql')
validateServiceFiles(srmServiceRoot)
validateColumnEnumUsage(srmServiceRoot)

const skylineServiceRoot = resolve(__dirname, '../src/schema/chat-web-skyline-mysql')
validateServiceFiles(skylineServiceRoot)
validateColumnEnumUsage(skylineServiceRoot)

const taskServiceRoot = resolve(__dirname, '../src/schema/chat-web-task-mysql')
validateServiceFiles(taskServiceRoot)
validateColumnEnumUsage(taskServiceRoot)

const smsServiceRoot = resolve(__dirname, '../src/schema/chat-web-sms-mysql')
validateServiceFiles(smsServiceRoot)
validateColumnEnumUsage(smsServiceRoot)

validateTable({
    entity: financeSchema.TbFinanceBrand,
    dto: financeSchema.TbFinanceBrandDto,
    columns: financeSchema.TbFinanceBrandColumn,
    sqlPath: resolve(financeServiceRoot, 'sql/tb_finance_brand.sql'),
    enumComments: [financeSchema.TbFinanceBrandStatusDefinition.comment]
})

validateTable({
    entity: financeSchema.TbFinanceCurrency,
    dto: financeSchema.TbFinanceCurrencyDto,
    columns: financeSchema.TbFinanceCurrencyColumn,
    sqlPath: resolve(financeServiceRoot, 'sql/tb_finance_currency.sql'),
    enumComments: [financeSchema.TbFinanceCurrencyStatusDefinition.comment]
})

validateTable({
    entity: financeSchema.TbFinanceCurrencyExchange,
    dto: financeSchema.TbFinanceCurrencyExchangeDto,
    columns: financeSchema.TbFinanceCurrencyExchangeColumn,
    sqlPath: resolve(financeServiceRoot, 'sql/tb_finance_currency_exchange.sql')
})

validateTable({
    entity: financeSchema.TbFinanceCountry,
    dto: financeSchema.TbFinanceCountryDto,
    columns: financeSchema.TbFinanceCountryColumn,
    sqlPath: resolve(financeServiceRoot, 'sql/tb_finance_country.sql'),
    enumComments: [financeSchema.TbFinanceCountryStatusDefinition.comment]
})

validateTable({
    entity: financeSchema.TbFinanceFrozenSms,
    dto: financeSchema.TbFinanceFrozenSmsDto,
    columns: financeSchema.TbFinanceFrozenSmsColumn,
    sqlPath: resolve(financeServiceRoot, 'sql/tb_finance_frozen_sms.sql')
})

validateTable({
    entity: crmSchema.TbCrmUser,
    dto: crmSchema.TbCrmUserDto,
    columns: crmSchema.TbCrmUserColumn,
    sqlPath: resolve(crmServiceRoot, 'sql/tb_crm_user.sql'),
    enumComments: [
        crmSchema.TbCrmUserStatusDefinition.comment,
        crmSchema.TbCrmUserPayModeDefinition.comment,
        crmSchema.TbCrmUserClassTypeDefinition.comment,
        crmSchema.TbCrmUserStageDefinition.comment,
        crmSchema.TbCrmUserAuthStatusDefinition.comment
    ]
})

validateTable({
    entity: crmSchema.TbCrmUserConfig,
    dto: crmSchema.TbCrmUserConfigDto,
    columns: crmSchema.TbCrmUserConfigColumn,
    sqlPath: resolve(crmServiceRoot, 'sql/tb_crm_user_config.sql')
})

validateTable({
    entity: crmSchema.TbCrmUserContact,
    dto: crmSchema.TbCrmUserContactDto,
    columns: crmSchema.TbCrmUserContactColumn,
    sqlPath: resolve(crmServiceRoot, 'sql/tb_crm_user_contact.sql'),
    enumComments: [crmSchema.TbCrmUserContactStatusDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmUser,
    dto: srmSchema.TbSrmUserDto,
    columns: srmSchema.TbSrmUserColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_user.sql'),
    enumComments: [
        srmSchema.TbSrmUserStatusDefinition.comment,
        srmSchema.TbSrmUserPayModeDefinition.comment,
        srmSchema.TbSrmUserStageDefinition.comment
    ]
})

validateTable({
    entity: srmSchema.TbSrmUserConfig,
    dto: srmSchema.TbSrmUserConfigDto,
    columns: srmSchema.TbSrmUserConfigColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_user_config.sql')
})

validateTable({
    entity: srmSchema.TbSrmUserContact,
    dto: srmSchema.TbSrmUserContactDto,
    columns: srmSchema.TbSrmUserContactColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_user_contact.sql'),
    enumComments: [srmSchema.TbSrmUserContactStatusDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmChannel,
    dto: srmSchema.TbSrmChannelDto,
    columns: srmSchema.TbSrmChannelColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_channel.sql'),
    enumComments: [srmSchema.TbSrmChannelStatusDefinition.comment, smsSchema.TbSmsAppTypeDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmChannelPort,
    dto: srmSchema.TbSrmChannelPortDto,
    columns: srmSchema.TbSrmChannelPortColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_channel_port.sql'),
    enumComments: [srmSchema.TbSrmChannelPortStatusDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmRoute,
    dto: srmSchema.TbSrmRouteDto,
    columns: srmSchema.TbSrmRouteColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_route.sql'),
    enumComments: [srmSchema.TbSrmRouteStatusDefinition.comment, srmSchema.TbSrmRouteTypeDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmRouteRule,
    dto: srmSchema.TbSrmRouteRuleDto,
    columns: srmSchema.TbSrmRouteRuleColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_route_rule.sql'),
    enumComments: [srmSchema.TbSrmRouteRuleStatusDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmRouteApp,
    dto: srmSchema.TbSrmRouteAppDto,
    columns: srmSchema.TbSrmRouteAppColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_route_app.sql'),
    enumComments: [srmSchema.TbSrmRouteAppStatusDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmRouteChannel,
    dto: srmSchema.TbSrmRouteChannelDto,
    columns: srmSchema.TbSrmRouteChannelColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_route_channel.sql'),
    enumComments: [srmSchema.TbSrmRouteChannelStatusDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmSimbank,
    dto: srmSchema.TbSrmSimbankDto,
    columns: srmSchema.TbSrmSimbankColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_simbank.sql'),
    enumComments: [srmSchema.TbSrmSimbankStatusDefinition.comment, srmSchema.TbSrmSimbankOnlineDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmSimbankPort,
    dto: srmSchema.TbSrmSimbankPortDto,
    columns: srmSchema.TbSrmSimbankPortColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_simbank_port.sql'),
    enumComments: [
        srmSchema.TbSrmSimbankPortActivateStatusDefinition.comment,
        srmSchema.TbSrmSimbankPortInsertStatusDefinition.comment,
        srmSchema.TbSrmSimbankPortStatusDefinition.comment
    ]
})

validateTable({
    entity: financeSchema.TbFinanceSrmUserWallet,
    dto: financeSchema.TbFinanceSrmUserWalletDto,
    columns: financeSchema.TbFinanceSrmUserWalletColumn,
    sqlPath: resolve(financeServiceRoot, 'sql/tb_finance_srm_user_wallet.sql'),
    enumComments: [financeSchema.TbFinanceSrmUserWalletPayModeDefinition.comment]
})

validateTable({
    entity: financeSchema.TbFinanceSrmUserDeduct,
    dto: financeSchema.TbFinanceSrmUserDeductDto,
    columns: financeSchema.TbFinanceSrmUserDeductColumn,
    sqlPath: resolve(financeServiceRoot, 'sql/tb_finance_srm_user_deduct.sql'),
    enumComments: [financeSchema.TbFinanceSrmUserDeductBizTypeDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmBillingOutbox,
    dto: srmSchema.TbSrmBillingOutboxDto,
    columns: srmSchema.TbSrmBillingOutboxColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_billing_outbox.sql'),
    enumComments: [srmSchema.TbSrmBillingOutboxTriggerDefinition.comment, srmSchema.TbSrmBillingOutboxStatusDefinition.comment]
})

validateTable({
    entity: srmSchema.TbSrmSimbankMessage,
    dto: srmSchema.TbSrmSimbankMessageDto,
    columns: srmSchema.TbSrmSimbankMessageColumn,
    sqlPath: resolve(srmServiceRoot, 'sql/tb_srm_simbank_message.sql'),
    enumComments: [
        srmSchema.TbSrmSimbankMessageSourceDefinition.comment,
        srmSchema.TbSrmSimbankMessageTypeDefinition.comment,
        srmSchema.TbSrmSimbankMessageEncodingDefinition.comment,
        srmSchema.TbSrmSimbankMessageSendStatusDefinition.comment
    ]
})

validateTable({
    entity: smsSchema.TbSmsApp,
    dto: smsSchema.TbSmsAppDto,
    columns: smsSchema.TbSmsAppColumn,
    sqlPath: resolve(smsServiceRoot, 'sql/tb_sms_app.sql'),
    enumComments: [smsSchema.TbSmsAppStatusDefinition.comment, smsSchema.TbSmsAppTypeDefinition.comment]
})

validateTable({
    entity: smsSchema.TbSmsQuoteDraft,
    dto: smsSchema.TbSmsQuoteDraftDto,
    columns: smsSchema.TbSmsQuoteDraftColumn,
    sqlPath: resolve(smsServiceRoot, 'sql/tb_sms_quote_draft.sql'),
    enumComments: [smsSchema.TbSmsQuoteDraftSourceDefinition.comment, smsSchema.TbSmsQuoteDraftStatusDefinition.comment]
})

validateTable({
    entity: smsSchema.TbSmsQuote,
    dto: smsSchema.TbSmsQuoteDto,
    columns: smsSchema.TbSmsQuoteColumn,
    sqlPath: resolve(smsServiceRoot, 'sql/tb_sms_quote.sql'),
    enumComments: [smsSchema.TbSmsQuoteStatusDefinition.comment]
})

validateTable({
    entity: skylineSchema.TbSkylineDatetaskSystem,
    dto: skylineSchema.TbSkylineDatetaskSystemDto,
    columns: skylineSchema.TbSkylineDatetaskSystemColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_datetask_system.sql'),
    enumComments: [
        skylineSchema.TbSkylineDatetaskSystemTypeDefinition.comment,
        skylineSchema.TbSkylineDatetaskSystemStatusDefinition.comment
    ]
})

validateTable({
    entity: skylineSchema.TbSkylineDatetaskLog,
    dto: skylineSchema.TbSkylineDatetaskLogDto,
    columns: skylineSchema.TbSkylineDatetaskLogColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_datetask_log.sql'),
    enumComments: [skylineSchema.TbSkylineDatetaskLogStatusDefinition.comment, skylineSchema.TbSkylineDatetaskLogTriggerDefinition.comment]
})

validateTable({
    entity: skylineSchema.TbSkylineChunkModuleEntity,
    dto: skylineSchema.TbSkylineChunkModuleDto,
    columns: skylineSchema.TbSkylineChunkModuleColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_chunk_module.sql'),
    enumComments: [
        skylineSchema.TbSkylineChunkModuleDefinition.comment,
        skylineSchema.TbSkylineChunkModuleKindDefinition.comment,
        skylineSchema.TbSkylineChunkModuleTypeDefinition.comment
    ]
})

validateTable({
    entity: skylineSchema.TbSkylineUser,
    dto: skylineSchema.TbSkylineUserDto,
    columns: skylineSchema.TbSkylineUserColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_user.sql'),
    enumComments: [skylineSchema.TbSkylineUserStatusDefinition.comment, skylineSchema.TbSkylineUserEmploymentStatusDefinition.comment]
})

validateTable({
    entity: skylineSchema.TbSkylineOrganization,
    dto: skylineSchema.TbSkylineOrganizationDto,
    columns: skylineSchema.TbSkylineOrganizationColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_organization.sql'),
    enumComments: [skylineSchema.TbSkylineOrganizationTypeDefinition.comment, skylineSchema.TbSkylineOrganizationStatusDefinition.comment]
})

validateTable({
    entity: skylineSchema.TbSkylineOrganizationClosure,
    dto: skylineSchema.TbSkylineOrganizationClosureDto,
    columns: skylineSchema.TbSkylineOrganizationClosureColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_organization_closure.sql')
})

validateTable({
    entity: skylineSchema.TbSkylineUserOrganization,
    dto: skylineSchema.TbSkylineUserOrganizationDto,
    columns: skylineSchema.TbSkylineUserOrganizationColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_user_organization.sql'),
    enumComments: [skylineSchema.TbSkylineUserOrganizationStatusDefinition.comment]
})

validateTable({
    entity: skylineSchema.TbSkylineUserChunk,
    dto: skylineSchema.TbSkylineUserChunkDto,
    columns: skylineSchema.TbSkylineUserChunkColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_user_chunk.sql'),
    enumComments: [skylineSchema.TbSkylineUserChunkLinkNameDefinition.comment]
})

validateTable({
    entity: skylineSchema.TbSkylineCountry,
    dto: skylineSchema.TbSkylineCountryDto,
    columns: skylineSchema.TbSkylineCountryColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_country.sql'),
    enumComments: [skylineSchema.TbSkylineCountryStatusDefinition.comment]
})

validateTable({
    entity: skylineSchema.TbSkylineSheet,
    dto: skylineSchema.TbSkylineSheetDto,
    columns: skylineSchema.TbSkylineSheetColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_sheet.sql'),
    enumComments: [
        skylineSchema.TbSkylineSheetTypeDefinition.comment,
        skylineSchema.TbSkylineSheetStatusDefinition.comment,
        skylineSchema.TbSkylineSheetVisibleDefinition.comment
    ]
})

validateTable({
    entity: skylineSchema.TbSkylineRole,
    dto: skylineSchema.TbSkylineRoleDto,
    columns: skylineSchema.TbSkylineRoleColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_role.sql'),
    enumComments: [skylineSchema.TbSkylineRoleStatusDefinition.comment]
})

validateTable({
    entity: skylineSchema.TbSkylineUserRole,
    dto: skylineSchema.TbSkylineUserRoleDto,
    columns: skylineSchema.TbSkylineUserRoleColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_user_role.sql')
})

validateTable({
    entity: skylineSchema.TbSkylineRoleSheet,
    dto: skylineSchema.TbSkylineRoleSheetDto,
    columns: skylineSchema.TbSkylineRoleSheetColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_role_sheet.sql')
})

validateTable({
    entity: skylineSchema.TbSkylineRoleDataScope,
    dto: skylineSchema.TbSkylineRoleDataScopeDto,
    columns: skylineSchema.TbSkylineRoleDataScopeColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_role_data_scope.sql'),
    enumComments: [skylineSchema.TbSkylineRoleDataScopeTypeDefinition.comment, skylineSchema.TbSkylineRoleDataScopeStatusDefinition.comment]
})

validateTable({
    entity: skylineSchema.TbSkylineRoleDataScopeOrganization,
    dto: skylineSchema.TbSkylineRoleDataScopeOrganizationDto,
    columns: skylineSchema.TbSkylineRoleDataScopeOrganizationColumn,
    sqlPath: resolve(skylineServiceRoot, 'sql/tb_skyline_role_data_scope_organization.sql')
})

validateTable({
    entity: taskSchema.TbTaskCron,
    dto: taskSchema.TbTaskCronDto,
    columns: taskSchema.TbTaskCronColumn,
    sqlPath: resolve(taskServiceRoot, 'sql/tb_task_cron.sql'),
    enumComments: [taskSchema.TbTaskCronStatusDefinition.comment]
})

validateTable({
    entity: taskSchema.TbTaskExecution,
    dto: taskSchema.TbTaskExecutionDto,
    columns: taskSchema.TbTaskExecutionColumn,
    sqlPath: resolve(taskServiceRoot, 'sql/tb_task_execution.sql'),
    enumComments: [taskSchema.TbTaskExecutionStatusDefinition.comment, taskSchema.TbTaskExecutionTriggerDefinition.comment]
})

console.log('Schema consistency validation passed.')
