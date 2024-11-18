import type { Callback, baseObj } from '../../types'

/**
 * @description 监听事件
 * @param target 监听对象
 * @param event 事件名称
 * @param handler 回调函数
 */
export function on(
  target: any,
  event: string,
  handler: Callback,
  options = false,
) {
  target.addEventListener(event, handler, options)
}

/**
 * @description 替换对象上的属性
 * @param source 源对象
 * @param name 替换对象名称
 * @param replacement 替换对象
 * @param isForced 是否强制替换
 * @return {void}
 */
export function replaceObj(
  source: baseObj,
  name: string,
  replacement: Callback,
  isForced = false,
): void {
  if (source === undefined) {
    return
  }
  if (name in source || isForced) {
    const original = source[name]
    const wrapped = replacement(original)
    if (typeof wrapped === 'function') {
      source[name] = wrapped
    }
  }
}

/**
 * @description 节流函数
 * @param fn 传入函数
 * @param delay 延迟事件
 * @returns {*}
 */
export function throttle(fn: Callback, delay: number): Callback {
  let canRun = true
  return function (this: any, ...args: any[]) {
    if (!canRun) return
    fn.apply(this, args)
    canRun = false
    setTimeout(() => {
      canRun = true
    }, delay)
  }
}

/**
 * @description 获取当前时间戳
 * @returns {number}
 */
export function getTimestamp(): number {
  return Date.now()
}

/**
 * @description 获取当前时间，类似于 yyyy-mm-dd
 * @returns {string}
 */
export function getYMDHMS(): string {
  const datetime = new Date()
  const year = datetime.getFullYear(),
    month = ('0' + (datetime.getMonth() + 1)).slice(-2),
    date = ('0' + datetime.getDate()).slice(-2)
  return `${year}-${month}-${date}`
}

export function typeofAny(target: any): string {
  return Object.prototype.toString.call(target).slice(8, -1).toLowerCase()
}

/**
 * @description 校验传入参数是否正确
 * @param target 待校验对象
 * @param targetName 对象名称
 * @param expectedType 期望类型
 * @returns {boolean}
 */
export function validateOptions(
  target: any,
  targetName: string,
  expectedType: string,
) {
  if (!target) return false
  if (typeofAny(target) === expectedType) return true
  console.error(
    `webTracker: ${targetName}期望传入${expectedType}类型，目前是${typeofAny(target)}类型`,
  )
}

/**
 * @description 生成uuid
 * @returns {string}
 */
export function generateUUID(): string {
  let d = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      const r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
    },
  )
  return uuid
}
