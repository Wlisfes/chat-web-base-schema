const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

/**
 * 本地调试共享包：把本地构建产物覆盖到兄弟服务的 node_modules，或恢复成 npm 版本。
 *
 * 用法：
 * - node scripts/local-link.cjs link [服务名...]：覆盖安装本地产物，不传服务名时处理全部依赖本包的服务。
 * - node scripts/local-link.cjs unlink [服务名...]：删除本地产物并重新执行 yarn install，恢复 lock 中的 npm 版本。
 * - node scripts/local-link.cjs status：查看各服务当前使用的是本地产物还是 npm 版本。
 *
 * 不使用软链接，避免服务加载两份 typeorm、@nestjs/* 导致依赖注入和实体元数据异常；
 * 也不修改服务的 package.json 和 yarn.lock，不会产生需要提交的改动。
 */

const ROOT = path.resolve(__dirname, '..')
const WORKSPACE = path.resolve(ROOT, '..')
const PACKAGE = require(path.join(ROOT, 'package.json'))
/** 覆盖安装时写入的标记文件，用于区分本地产物和 npm 版本。 */
const MARKER = '.local-link.json'
/** 需要复制的内容，与 package.json 的 files 保持一致。 */
const COPY_ITEMS = ['dist', 'docs', 'README.md']

/** 查找工作区中依赖本包的服务。 */
function findServices() {
    return fs
        .readdirSync(WORKSPACE, { withFileTypes: true })
        .filter(item => item.isDirectory() && item.name !== path.basename(ROOT))
        .map(item => path.join(WORKSPACE, item.name))
        .filter(dir => {
            const file = path.join(dir, 'package.json')
            if (!fs.existsSync(file)) {
                return false
            }
            const json = JSON.parse(fs.readFileSync(file, 'utf8'))
            return Boolean({ ...json.dependencies, ...json.devDependencies }[PACKAGE.name])
        })
}

/** 按命令行参数筛选服务，支持完整目录名或省略 chat-web- 前缀、-service 后缀的简写。 */
function pickServices(names) {
    const services = findServices()
    if (names.length === 0) {
        return services
    }
    return names.map(name => {
        const found = services.find(dir => [path.basename(dir), path.basename(dir).replace(/^chat-web-|-service$/g, '')].includes(name))
        if (!found) {
            throw new Error(`未找到依赖 ${PACKAGE.name} 的服务：${name}`)
        }
        return found
    })
}

/** 服务中本包的安装目录。 */
function targetDir(service) {
    return path.join(service, 'node_modules', ...PACKAGE.name.split('/'))
}

/** 复制 SQL 文件，保持 src/schema 下的目录结构。 */
function copySql(source, target) {
    for (const item of fs.readdirSync(source, { withFileTypes: true })) {
        const from = path.join(source, item.name)
        const to = path.join(target, item.name)
        if (item.isDirectory()) {
            copySql(from, to)
        } else if (item.name.endsWith('.sql')) {
            fs.mkdirSync(target, { recursive: true })
            fs.copyFileSync(from, to)
        }
    }
}

/** 检查本地新增的运行时依赖是否已安装到服务中，未安装时给出提示。 */
function checkDependencies(service, target) {
    const missing = Object.keys(PACKAGE.dependencies ?? {}).filter(name => {
        return !fs.existsSync(path.join(target, 'node_modules', name)) && !fs.existsSync(path.join(service, 'node_modules', name))
    })
    if (missing.length > 0) {
        console.warn(`  警告：服务中缺少依赖 ${missing.join(', ')}，请在服务中临时安装或发布后再升级版本`)
    }
}

/** 覆盖安装本地构建产物，保留包内嵌套的 node_modules。 */
function link(service) {
    if (!fs.existsSync(path.join(ROOT, 'dist', 'index.js'))) {
        throw new Error('未找到 dist，请先执行 yarn build')
    }
    const target = targetDir(service)
    fs.mkdirSync(target, { recursive: true })
    for (const item of [...COPY_ITEMS, 'src']) {
        fs.rmSync(path.join(target, item), { recursive: true, force: true })
    }
    for (const item of COPY_ITEMS) {
        const source = path.join(ROOT, item)
        if (fs.existsSync(source)) {
            fs.cpSync(source, path.join(target, item), { recursive: true })
        }
    }
    copySql(path.join(ROOT, 'src', 'schema'), path.join(target, 'src', 'schema'))
    fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(target, 'package.json'))
    fs.writeFileSync(path.join(target, MARKER), JSON.stringify({ source: ROOT, linkedAt: new Date().toISOString() }, null, 4))
    console.log(`已覆盖本地产物：${path.basename(service)}`)
    checkDependencies(service, target)
}

/** 删除本地产物并重新安装，恢复 yarn.lock 中锁定的 npm 版本。 */
function unlink(service) {
    fs.rmSync(targetDir(service), { recursive: true, force: true })
    console.log(`正在恢复 npm 版本：${path.basename(service)}`)
    const result = spawnSync('yarn', ['install', '--frozen-lockfile', '--check-files'], { cwd: service, stdio: 'inherit', shell: true })
    if (result.status !== 0) {
        throw new Error(`恢复失败：${path.basename(service)}`)
    }
}

/** 输出各服务当前使用的版本来源。 */
function status(service) {
    const target = targetDir(service)
    const marker = path.join(target, MARKER)
    if (fs.existsSync(marker)) {
        console.log(`${path.basename(service)}：本地产物（${JSON.parse(fs.readFileSync(marker, 'utf8')).linkedAt}）`)
    } else if (fs.existsSync(path.join(target, 'package.json'))) {
        console.log(`${path.basename(service)}：npm ${JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8')).version}`)
    } else {
        console.log(`${path.basename(service)}：未安装`)
    }
}

function main() {
    const [command, ...names] = process.argv.slice(2)
    const handlers = { link, unlink, status }
    if (!handlers[command]) {
        throw new Error('用法：node scripts/local-link.cjs <link|unlink|status> [服务名...]')
    }
    pickServices(names).forEach(handlers[command])
}

try {
    main()
} catch (error) {
    console.error(error.message)
    process.exit(1)
}
