import { UAParser } from 'ua-parser-js'
import { webTracker, Window } from '../../types/index'
import { variableTypeDetection } from './verifyType'

/**
 * @description 获取全局对象
 */
export function getWindow(): Window {
  return window as unknown as Window
}

/**
 * @description 判断是否在浏览器环境
 */
export const isBrowserENV = variableTypeDetection.isWindow(
  typeof window !== 'undefined' ? window : undefined,
)

/**
 * @description 获取全局对象
 */
export function getSupport() {
  _global.__webTracker__ = _global.__webTracker__ || ({} as webTracker)
  return _global.__webTracker__
}

const _global = getWindow()
const _support = getSupport()
const uaResult = new UAParser().getResult()

_support.hasError = false

_support.errorMap = new Map()

_support.replaceFlag = _support.replaceFlag || {}
const replaceFlag = _support.replaceFlag

/**
 * @description 设置全局替换标识
 * @param replaceType
 * @param flag
 */
export function setFlag(replaceType: string, flag: boolean) {
  if (replaceFlag[replaceType]) return
  replaceFlag[replaceType] = flag
}

_support.deviceInfo = {
  browserVersion: uaResult.browser.version, // // 浏览器版本号 107.0.0.0
  browser: uaResult.browser.name, // 浏览器类型 Chrome
  osVersion: uaResult.os.version, // 操作系统 电脑系统 10
  os: uaResult.os.name, // Windows
  ua: uaResult.ua,
  device: uaResult.device.model ? uaResult.device.model : 'Unknow',
  device_type: uaResult.device.type ? uaResult.device.type : 'Pc',
}

export { _global, _support }
