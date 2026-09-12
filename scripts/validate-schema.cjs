require('reflect-metadata')

const { readFileSync, readdirSync } = require('node:fs')
const { basename, extname, resolve } = require('node:path')
const { getMetadataArgsStorage } = require('typeorm')
const accountSchema = require('../dist/src/schema/chat-web-account-mysql')
const financeSchema = require('../dist/src/schema/chat-web-finance-mysql')
const crmSchema = require('../dist/src/schema/chat-web-crm-mysql')
const skylineSchema = require('../dist/src/schema/chat-web-skyline-mysql')
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

const accountServiceRoot = resolve(__dirname, '../src/schema/chat-web-account-mysql')
validateServiceFiles(accountServiceRoot)

const financeServiceRoot = resolve(__dirname, '../src/schema/chat-web-finance-mysql')
validateServiceFiles(financeServiceRoot)

const crmServiceRoot = resolve(__dirname, '../src/schema/chat-web-crm-mysql')
validateServiceFiles(crmServiceRoot)

const skylineServiceRoot = resolve(__dirname, '../src/schema/chat-web-skyline-mysql')
validateServiceFiles(skylineServiceRoot)

validateTable({
    entity: accountSchema.TbAccountUser,
    dto: accountSchema.TbAccountUserDto,
    columns: accountSchema.TbAccountUserColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_user.sql'),
    enumComments: [accountSchema.TbAccountUserStatusDefinition.comment, accountSchema.TbAccountUserEmploymentStatusDefinition.comment]
})

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
    entity: financeSchema.TbFinanceBasicSmsRate,
    dto: financeSchema.TbFinanceBasicSmsRateDto,
    columns: financeSchema.TbFinanceBasicSmsRateColumn,
    sqlPath: resolve(financeServiceRoot, 'sql/tb_finance_basic_sms_rate.sql')
})

validateTable({
    entity: crmSchema.TbCrmConsumer,
    dto: crmSchema.TbCrmConsumerDto,
    columns: crmSchema.TbCrmConsumerColumn,
    sqlPath: resolve(crmServiceRoot, 'sql/tb_crm_consumer.sql'),
    enumComments: [
        crmSchema.TbCrmConsumerStatusDefinition.comment,
        crmSchema.TbCrmConsumerPayModeDefinition.comment,
        crmSchema.TbCrmConsumerClassTypeDefinition.comment,
        crmSchema.TbCrmConsumerStageDefinition.comment,
        crmSchema.TbCrmConsumerAuthStatusDefinition.comment,
        crmSchema.TbCrmConsumerSourceDefinition.comment
    ]
})

validateTable({
    entity: crmSchema.TbCrmSmsApplication,
    dto: crmSchema.TbCrmSmsApplicationDto,
    columns: crmSchema.TbCrmSmsApplicationColumn,
    sqlPath: resolve(crmServiceRoot, 'sql/tb_crm_sms_application.sql'),
    enumComments: [crmSchema.TbCrmSmsApplicationStatusDefinition.comment, crmSchema.TbCrmSmsApplicationTypeDefinition.comment]
})

validateTable({
    entity: crmSchema.TbCrmSmsQuoteDraft,
    dto: crmSchema.TbCrmSmsQuoteDraftDto,
    columns: crmSchema.TbCrmSmsQuoteDraftColumn,
    sqlPath: resolve(crmServiceRoot, 'sql/tb_crm_sms_quote_draft.sql'),
    enumComments: [crmSchema.TbCrmSmsQuoteDraftSourceDefinition.comment, crmSchema.TbCrmSmsQuoteDraftStatusDefinition.comment]
})

validateTable({
    entity: crmSchema.TbCrmSmsQuote,
    dto: crmSchema.TbCrmSmsQuoteDto,
    columns: crmSchema.TbCrmSmsQuoteColumn,
    sqlPath: resolve(crmServiceRoot, 'sql/tb_crm_sms_quote.sql'),
    enumComments: [crmSchema.TbCrmSmsQuoteStatusDefinition.comment]
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
    entity: accountSchema.TbAccountOrganization,
    dto: accountSchema.TbAccountOrganizationDto,
    columns: accountSchema.TbAccountOrganizationColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_organization.sql'),
    enumComments: [accountSchema.TbAccountOrganizationTypeDefinition.comment, accountSchema.TbAccountOrganizationStatusDefinition.comment]
})

validateTable({
    entity: accountSchema.TbAccountOrganizationClosure,
    dto: accountSchema.TbAccountOrganizationClosureDto,
    columns: accountSchema.TbAccountOrganizationClosureColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_organization_closure.sql')
})

validateTable({
    entity: accountSchema.TbAccountUserOrganization,
    dto: accountSchema.TbAccountUserOrganizationDto,
    columns: accountSchema.TbAccountUserOrganizationColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_user_organization.sql'),
    enumComments: [accountSchema.TbAccountUserOrganizationStatusDefinition.comment]
})

validateTable({
    entity: accountSchema.TbAccountPosition,
    dto: accountSchema.TbAccountPositionDto,
    columns: accountSchema.TbAccountPositionColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_position.sql')
})

validateTable({
    entity: accountSchema.TbAccountUserPosition,
    dto: accountSchema.TbAccountUserPositionDto,
    columns: accountSchema.TbAccountUserPositionColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_user_position.sql')
})

validateTable({
    entity: accountSchema.TbAccountMenu,
    dto: accountSchema.TbAccountMenuDto,
    columns: accountSchema.TbAccountMenuColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_menu.sql'),
    enumComments: [accountSchema.TbAccountMenuTypeDefinition.comment, accountSchema.TbAccountMenuStatusDefinition.comment]
})

validateTable({
    entity: accountSchema.TbAccountRole,
    dto: accountSchema.TbAccountRoleDto,
    columns: accountSchema.TbAccountRoleColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_role.sql'),
    enumComments: [accountSchema.TbAccountRoleStatusDefinition.comment]
})

validateTable({
    entity: accountSchema.TbAccountUserRole,
    dto: accountSchema.TbAccountUserRoleDto,
    columns: accountSchema.TbAccountUserRoleColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_user_role.sql')
})

validateTable({
    entity: accountSchema.TbAccountRoleMenu,
    dto: accountSchema.TbAccountRoleMenuDto,
    columns: accountSchema.TbAccountRoleMenuColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_role_menu.sql')
})

validateTable({
    entity: accountSchema.TbAccountRoleDataScope,
    dto: accountSchema.TbAccountRoleDataScopeDto,
    columns: accountSchema.TbAccountRoleDataScopeColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_role_data_scope.sql'),
    enumComments: [accountSchema.TbAccountRoleDataScopeTypeDefinition.comment, accountSchema.TbAccountRoleDataScopeStatusDefinition.comment]
})

validateTable({
    entity: accountSchema.TbAccountRoleDataScopeOrganization,
    dto: accountSchema.TbAccountRoleDataScopeOrganizationDto,
    columns: accountSchema.TbAccountRoleDataScopeOrganizationColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_role_data_scope_organization.sql')
})

console.log('Schema consistency validation passed.')
