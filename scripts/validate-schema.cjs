require('reflect-metadata')

const { readFileSync, readdirSync } = require('node:fs')
const { basename, extname, resolve } = require('node:path')
const { getMetadataArgsStorage } = require('typeorm')
const accountSchema = require('../dist/src/schema/chat-web-account-mysql')
const { DataBaseAdapter } = require('../dist/src/utils')

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
    const entityColumns = metadata.columns.filter(column => column.target === entity || column.target === DataBaseAdapter)
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

validateTable({
    entity: accountSchema.TbAccountUser,
    dto: accountSchema.TbAccountUserDto,
    columns: accountSchema.TbAccountUserColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_user.sql'),
    enumComments: [accountSchema.TbAccountUserStatusComment, accountSchema.TbAccountUserEmploymentStatusComment]
})

validateTable({
    entity: accountSchema.TbAccountOrganization,
    dto: accountSchema.TbAccountOrganizationDto,
    columns: accountSchema.TbAccountOrganizationColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_organization.sql'),
    enumComments: [accountSchema.TbAccountOrganizationTypeComment, accountSchema.TbAccountOrganizationStatusComment]
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
    enumComments: [accountSchema.TbAccountUserOrganizationStatusComment]
})

validateTable({
    entity: accountSchema.TbAccountMenu,
    dto: accountSchema.TbAccountMenuDto,
    columns: accountSchema.TbAccountMenuColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_menu.sql'),
    enumComments: [accountSchema.TbAccountMenuTypeComment, accountSchema.TbAccountMenuStatusComment]
})

validateTable({
    entity: accountSchema.TbAccountRole,
    dto: accountSchema.TbAccountRoleDto,
    columns: accountSchema.TbAccountRoleColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_role.sql'),
    enumComments: [accountSchema.TbAccountRoleStatusComment]
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
    enumComments: [accountSchema.TbAccountRoleDataScopeTypeComment, accountSchema.TbAccountRoleDataScopeStatusComment]
})

validateTable({
    entity: accountSchema.TbAccountRoleDataScopeOrganization,
    dto: accountSchema.TbAccountRoleDataScopeOrganizationDto,
    columns: accountSchema.TbAccountRoleDataScopeOrganizationColumn,
    sqlPath: resolve(accountServiceRoot, 'sql/tb_account_role_data_scope_organization.sql')
})

console.log('Schema consistency validation passed.')
