
/**
 * Check if a string starts with $ or _
 */
export function isReserved (str) {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable, // 可枚举
    writable: true,
    configurable: true // 不能再define
  })
}
