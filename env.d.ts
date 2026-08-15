/**通用对象**/
declare type Omix<T = Record<string, any>> = T & Record<string, any>

/**从枚举对象中提取所有枚举值的联合类型**/
declare type OmixEnumValues<T> = T[Exclude<keyof T, 'name' | 'value'>] extends { value: infer V } ? V : never

