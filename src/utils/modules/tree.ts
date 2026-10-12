export interface TreeNodeLike {
    keyId: number
    parentKeyId?: number | null
    sort: number
}

export type TreeNode<TNode extends TreeNodeLike> = TNode & {
    children: TreeNode<TNode>[]
}

/** 将已经校验过父子关系的扁平节点组装为稳定排序的树。 */
export function buildTree<TNode extends TreeNodeLike>(nodes: TNode[]): TreeNode<TNode>[] {
    const byKeyId = new Map<number, TreeNode<TNode>>()
    const roots: TreeNode<TNode>[] = []

    for (const node of nodes) {
        byKeyId.set(node.keyId, { ...node, children: [] })
    }

    for (const node of byKeyId.values()) {
        const parent = node.parentKeyId ? byKeyId.get(node.parentKeyId) : undefined
        if (parent) {
            parent.children.push(node)
        } else {
            roots.push(node)
        }
    }

    const sortNodes = (items: TreeNode<TNode>[]) => {
        items.sort((left, right) => left.sort - right.sort || left.keyId - right.keyId)
        items.forEach(item => sortNodes(item.children))
    }
    sortNodes(roots)
    return roots
}

/** 校验邻接表不存在缺失父节点和环。 */
export function assertValidTree(nodes: TreeNodeLike[], label: string): void {
    const byKeyId = new Map(nodes.map(node => [node.keyId, node]))

    for (const node of nodes) {
        if (node.parentKeyId && !byKeyId.has(node.parentKeyId)) {
            throw new Error(`${label} ${node.keyId} 的父节点 ${node.parentKeyId} 不存在`)
        }

        const visited = new Set<number>([node.keyId])
        let current = node
        while (current.parentKeyId) {
            if (visited.has(current.parentKeyId)) {
                throw new Error(`${label}不能形成循环层级：${[...visited, current.parentKeyId].join(' -> ')}`)
            }
            visited.add(current.parentKeyId)
            const parent = byKeyId.get(current.parentKeyId)
            if (!parent) {
                break
            }
            current = parent
        }
    }
}

/** 通用树工具字段配置；children 可改为 items 等业务字段。 */
export interface TreeToolConfig {
    id?: string
    pid?: string
    children?: string
}

/** 通用树工具配置的完整形态。 */
export type ResolvedTreeToolConfig = Required<TreeToolConfig>

/** 通用树节点判断函数。 */
export type TreeNodePredicate<TNode> = (node: TNode) => boolean

/** 通用树节点遍历函数。 */
export type TreeNodeVisitor<TNode> = (node: TNode) => void

/** 通用树工具默认字段。 */
export const DEFAULT_TREE_TOOL_CONFIG: ResolvedTreeToolConfig = { id: 'id', pid: 'pid', children: 'children' }

/** 合并通用树工具字段配置。 */
export function resolveTreeToolConfig(config: TreeToolConfig = {}): ResolvedTreeToolConfig {
    return { ...DEFAULT_TREE_TOOL_CONFIG, ...config }
}

/** 读取节点子级列表，不存在或不是数组时返回空数组。 */
function readTreeChildren<TNode>(node: TNode, children: string): TNode[] {
    const value = (node as Record<string, unknown>)[children]
    return Array.isArray(value) ? (value as TNode[]) : []
}

/** 写入节点子级列表。 */
function writeTreeChildren<TNode>(node: TNode, children: string, value: TNode[]): void {
    ;(node as Record<string, unknown>)[children] = value
}

/**
 * 列表结构转树结构。
 *
 * 会浅拷贝列表节点，不修改入参；父级不存在于列表中的节点作为根节点返回。
 */
export function fromTreeList<TNode extends object>(list: TNode[], config?: TreeToolConfig): TNode[] {
    const { id, pid, children } = resolveTreeToolConfig(config)
    const nodes = list.map(item => ({ ...item, [children]: [] }) as TNode)
    const byId = new Map(nodes.map(node => [(node as Record<string, unknown>)[id], node]))
    const roots: TNode[] = []
    for (const node of nodes) {
        const parent = byId.get((node as Record<string, unknown>)[pid])
        if (parent && parent !== node) {
            readTreeChildren(parent, children).push(node)
        } else {
            roots.push(node)
        }
    }
    return roots
}

/** 树结构按深度优先顺序转换为列表结构，返回原节点引用。 */
export function toTreeList<TNode extends object>(tree: TNode[], config?: TreeToolConfig): TNode[] {
    const list: TNode[] = []
    forEachTree(tree, node => list.push(node), config)
    return list
}

/** 广度优先查找第一个符合条件的节点。 */
export function findTreeNode<TNode extends object>(
    tree: TNode[],
    callback: TreeNodePredicate<TNode>,
    config?: TreeToolConfig
): TNode | null {
    const { children } = resolveTreeToolConfig(config)
    const queue = [...tree]
    for (let index = 0; index < queue.length; index++) {
        const node = queue[index]
        if (callback(node)) {
            return node
        }
        queue.push(...readTreeChildren(node, children))
    }
    return null
}

/** 广度优先查找所有符合条件的节点。 */
export function findTreeNodeAll<TNode extends object>(tree: TNode[], callback: TreeNodePredicate<TNode>, config?: TreeToolConfig): TNode[] {
    const { children } = resolveTreeToolConfig(config)
    const queue = [...tree]
    const result: TNode[] = []
    for (let index = 0; index < queue.length; index++) {
        const node = queue[index]
        if (callback(node)) {
            result.push(node)
        }
        queue.push(...readTreeChildren(node, children))
    }
    return result
}

/** 深度优先查找第一个符合条件节点的路径，包含祖先和命中节点。 */
export function findTreePath<TNode extends object>(
    tree: TNode[],
    callback: TreeNodePredicate<TNode>,
    config?: TreeToolConfig
): TNode[] | null {
    return findTreePathAll(tree, callback, config, true)[0] ?? null
}

/** 深度优先查找所有符合条件节点的路径，包含祖先和命中节点。 */
export function findTreePathAll<TNode extends object>(
    tree: TNode[],
    callback: TreeNodePredicate<TNode>,
    config?: TreeToolConfig,
    firstOnly = false
): TNode[][] {
    const { children } = resolveTreeToolConfig(config)
    const result: TNode[][] = []
    const walk = (nodes: TNode[], path: TNode[]): boolean => {
        for (const node of nodes) {
            const current = [...path, node]
            if (callback(node)) {
                result.push(current)
                if (firstOnly) {
                    return true
                }
            }
            if (walk(readTreeChildren(node, children), current)) {
                return true
            }
        }
        return false
    }
    walk(tree, [])
    return result
}

/**
 * 过滤树节点，保留命中节点及其祖先节点。
 *
 * 返回浅拷贝后的新树，不修改入参；保留下来的节点始终带有配置的子级字段。
 */
export function filterTree<TNode extends object>(tree: TNode[], callback: TreeNodePredicate<TNode>, config?: TreeToolConfig): TNode[] {
    const { children } = resolveTreeToolConfig(config)
    const walk = (nodes: TNode[]): TNode[] => {
        return nodes.flatMap(item => {
            const node = { ...item }
            const matchedChildren = walk(readTreeChildren(item, children))
            writeTreeChildren(node, children, matchedChildren)
            return callback(node) || matchedChildren.length > 0 ? [node] : []
        })
    }
    return walk(tree)
}

/** 深度优先遍历树节点。 */
export function forEachTree<TNode extends object>(tree: TNode[], callback: TreeNodeVisitor<TNode>, config?: TreeToolConfig): void {
    const { children } = resolveTreeToolConfig(config)
    const stack = [...tree].reverse()
    while (stack.length > 0) {
        const node = stack.pop() as TNode
        callback(node)
        stack.push(...[...readTreeChildren(node, children)].reverse())
    }
}

/** 在目标节点所在层级插入新节点，返回是否插入成功。 */
function insertTreeNode<TNode extends object>(
    tree: TNode[],
    target: TNode,
    newNode: TNode,
    offset: 0 | 1,
    config?: TreeToolConfig
): boolean {
    const { children } = resolveTreeToolConfig(config)
    const walk = (nodes: TNode[]): boolean => {
        const index = nodes.indexOf(target)
        if (index >= 0) {
            nodes.splice(index + offset, 0, newNode)
            return true
        }
        return nodes.some(node => walk(readTreeChildren(node, children)))
    }
    return walk(tree)
}

/** 在 oldNode 前插入 newNode，返回是否插入成功。 */
export function insertTreeNodeBefore<TNode extends object>(
    tree: TNode[],
    newNode: TNode,
    oldNode: TNode,
    config?: TreeToolConfig
): boolean {
    return insertTreeNode(tree, oldNode, newNode, 0, config)
}

/** 在 oldNode 后插入 newNode，返回是否插入成功。 */
export function insertTreeNodeAfter<TNode extends object>(tree: TNode[], oldNode: TNode, newNode: TNode, config?: TreeToolConfig): boolean {
    return insertTreeNode(tree, oldNode, newNode, 1, config)
}

/** 原地删除所有符合条件的节点及其子孙节点，返回删除的节点数量。 */
export function removeTreeNode<TNode extends object>(tree: TNode[], callback: TreeNodePredicate<TNode>, config?: TreeToolConfig): number {
    const { children } = resolveTreeToolConfig(config)
    let removed = 0
    const walk = (nodes: TNode[]) => {
        for (let index = nodes.length - 1; index >= 0; index--) {
            if (callback(nodes[index])) {
                nodes.splice(index, 1)
                removed += 1
            } else {
                walk(readTreeChildren(nodes[index], children))
            }
        }
    }
    walk(tree)
    return removed
}

/** 修改整棵树的子级字段名，例如把 children 改为 items；返回原树。 */
export function renameTreeChildren<TNode extends object>(tree: TNode[], from: string, to: string): TNode[] {
    if (from === to) {
        return tree
    }
    forEachTree(
        tree,
        node => {
            const record = node as Record<string, unknown>
            record[to] = readTreeChildren(node, from)
            delete record[from]
        },
        { children: to }
    )
    return tree
}

/** 创建绑定固定字段配置的树工具实例。 */
export function createTreeTool(config: TreeToolConfig) {
    const resolved = resolveTreeToolConfig(config)
    return {
        config: resolved,
        fromList: <TNode extends object>(list: TNode[]) => fromTreeList(list, resolved),
        toList: <TNode extends object>(tree: TNode[]) => toTreeList(tree, resolved),
        findNode: <TNode extends object>(tree: TNode[], callback: TreeNodePredicate<TNode>) => findTreeNode(tree, callback, resolved),
        findNodeAll: <TNode extends object>(tree: TNode[], callback: TreeNodePredicate<TNode>) => findTreeNodeAll(tree, callback, resolved),
        findPath: <TNode extends object>(tree: TNode[], callback: TreeNodePredicate<TNode>) => findTreePath(tree, callback, resolved),
        findPathAll: <TNode extends object>(tree: TNode[], callback: TreeNodePredicate<TNode>) => findTreePathAll(tree, callback, resolved),
        filter: <TNode extends object>(tree: TNode[], callback: TreeNodePredicate<TNode>) => filterTree(tree, callback, resolved),
        forEach: <TNode extends object>(tree: TNode[], callback: TreeNodeVisitor<TNode>) => forEachTree(tree, callback, resolved),
        insertBefore: <TNode extends object>(tree: TNode[], newNode: TNode, oldNode: TNode) =>
            insertTreeNodeBefore(tree, newNode, oldNode, resolved),
        insertAfter: <TNode extends object>(tree: TNode[], oldNode: TNode, newNode: TNode) =>
            insertTreeNodeAfter(tree, oldNode, newNode, resolved),
        removeNode: <TNode extends object>(tree: TNode[], callback: TreeNodePredicate<TNode>) => removeTreeNode(tree, callback, resolved)
    }
}
