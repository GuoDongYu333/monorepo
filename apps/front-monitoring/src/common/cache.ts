const cache: string[] = []

/**
 * @description 缓存待发的请求数据
 * @param {string} data 存入待发的请求数据
 */
export function addCache(data: string) {
  cache.push(data)
}

/**
 * @description 获取缓存中的数据
 * @returns 缓存中的数据
 */
export function getCache() {
  return cache
}

/**
 * @description 清空缓存
 */
export function clearCache() {
  cache.length = 0
}
