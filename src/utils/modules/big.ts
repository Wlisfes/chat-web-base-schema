import big from 'big.js'

/**
 * 数字相加 A + B
 * @param a 数字A
 * @param b 数字B
 */
export function fetchPlusNumber(a: any, b: any) {
    return new big(Number(a || 0)).plus(Number(b || 0)).toNumber()
}

/**
 * 数字相减 A - B
 * @param a 数字A
 * @param b 数字B
 */
export function fetchMinusNumner(a: any, b: any) {
    return new big(Number(a || 0)).minus(Number(b || 0)).toNumber()
}

/**
 * 数字相乘 A * B
 * @param a 数字A
 * @param b 数字B
 */
export function fetchTimesNumber(a: any, b: any) {
    return new big(Number(a || 0)).times(Number(b || 0)).toNumber()
}

/**
 * 数字相除 A / B
 * @param a 数字A
 * @param b 数字B
 */
export function fetchDivNumber(a: any, b: any) {
    return new big(Number(a || 0)).div(Number(b || 0)).toNumber()
}
