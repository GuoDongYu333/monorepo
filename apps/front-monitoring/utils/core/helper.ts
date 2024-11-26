import type { Callback, baseObj } from '../../types'
import { setFlag } from './global'
import { EVENTTYPES } from '../../common'
import { variableTypeDetection } from './verifyType'
import { _support } from './global'

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

/**
 * @description 获取对象类型
 * @param target 待校验对象
 * @returns {string}
 */
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

/**
 * @description 设置是否开启对应监控
 * @param silentXhr 是否开启xhr监控
 * @param silentFetch 是否开启fetch监控
 * @param silentClick 是否开启点击监控
 * @param silentHistory 是否开启路由监控
 * @param silentError 是否开启错误监控
 * @param silentHashchange 是否开启hashchange监控
 * @param silentUnhandledrejection 是否开启promise监控
 * @param silentWhiteScreen 是否开启白屏监控
 */
export function setSilentFlag({
  silentXhr = true,
  silentFetch = true,
  silentClick = true,
  silentHistory = true,
  silentError = true,
  silentHashchange = true,
  silentUnhandledrejection = true,
  silentWhiteScreen = false,
}): void {
  setFlag(EVENTTYPES.XHR, !silentXhr)
  setFlag(EVENTTYPES.FETCH, !silentFetch)
  setFlag(EVENTTYPES.CLICK, !silentClick)
  setFlag(EVENTTYPES.HISTORY, !silentHistory)
  setFlag(EVENTTYPES.ERROR, !silentError)
  setFlag(EVENTTYPES.HASHCHANGE, !silentHashchange)
  setFlag(EVENTTYPES.UNHANDLEDREJECTION, !silentUnhandledrejection)
  setFlag(EVENTTYPES.WHITESCREEN, !silentWhiteScreen)
}

/**
 * @description 截取字符串
 * @param str 待截取字符串
 * @param interceptLength 截取长度
 * @returns {string}
 */
export function interceptStr(str: string, interceptLength: number): string {
  if (variableTypeDetection.isString(str)) {
    return str.slice(0, interceptLength)
  }
  return ''
}

/**
 * @description 将地址字符串转换成对象，
 * 输入：'https://xxxx.com/yyyy/zzzz?token=rrr&name=vv'
 * 输出：{
 *  "host": "xxxx.com",
 *  "path": "/yyyy/zzzz",
 *  "protocol": "https",
 *  "relative": "/yyyy/zzzz?token=rrr&name=vv"
 * }
 * @param url 待转换url
 * @returns {object} 包含host，path，protocol，relative等属性的对象
 */
export function parseUrlToObj(url: string) {
  if (!url) {
    return {}
  }
  const match = url.match(
    /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/,
  )
  if (!match) {
    return {}
  }
  const query = match[6] || ''
  const fragment = match[8] || ''
  return {
    host: match[4],
    path: match[5],
    protocol: match[2],
    relative: match[5] + query + fragment,
  }
}

/**
 * @description 获取错误id，用于去重
 * @param input 错误信息
 * @returns {string} 错误的id
 */
export function getErrorUid(input: string): string {
  return window.btoa(encodeURIComponent(input))
}

/**
 * @description 判断是否是重复的错误
 * @param hash 错误hash值，格式为eventtype+message+filename+columnNumber
 * @returns {boolean} 是否重复
 */
export function hashMapExist(hash: string): boolean {
  const exist = _support.errorMap.has(hash)
  if (!exist) {
    _support.errorMap.set(hash, true)
  }
  return exist
}

/**
 * @description 返回包含id、class、innerTextde字符串的标签
 * @param target html节点
 * @returns {string} 包含id、class、innerTextde字符串的标签
 */
export function htmlElementAsString(target: HTMLElement): string {
  const tagName = target.tagName.toLowerCase()
  if (tagName === 'body') {
    return ''
  }
  let classNames = target.classList.value

  classNames = classNames !== '' ? ` class='${classNames}'` : ''
  const id = target.id ? ` id="${target.id}"` : ''
  const innerText = target.innerText
  return `<${tagName}${id}${classNames !== '' ? classNames : ''}>${innerText}</${tagName}>`
}

/**
 * @description 获取当前页面的url
 * @returns {string} 当前页面的url
 */
export function getLocationHref(): string {
  if (typeof document === 'undefined' || document.location == null) return ''
  return document.location.href
}

/**
 * @description 判断上报地址是否是SDK地址
 * @param reportUrl SDK上报地址
 * @param targetUrl 上报地址
 * @returns {boolean} 是否是SDK上报地址
 */
export function isSDKTransportUrl(
  reportUrl: string,
  targetUrl: string,
): boolean {
  console.log('进来哦')
  let isSDK = false
  if (reportUrl && targetUrl.indexOf(reportUrl) !== -1) {
    isSDK = true
  }
  return isSDK
}
