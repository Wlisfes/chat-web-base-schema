/** 按关联主键索引的记录：links 为全部记录，linksOptions 按关联主键分组。 */
export type LinkIndex<TItem, TKey extends PropertyKey = number> = {
    links: TItem[]
    linksOptions: Map<TKey, TItem[]>
}

/** 按关联主键索引的记录：links 为全部记录，linksOptions 按关联主键分组。 */
export type LinkOptions<TItem, TKey extends PropertyKey = number> = {
    links: TItem[]
    linksOptions: Map<TKey, TItem>
}
