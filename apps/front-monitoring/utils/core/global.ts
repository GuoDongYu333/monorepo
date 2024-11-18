import { UAParser } from 'ua-parser-js'
import { webTracker, Window } from '../../types/index'
export function getWindow(): Window {
  return window as unknown as Window
}

export function getSupport() {
  _global.__webTracker__ = _global.__webTracker__ || ({} as webTracker)
  return _global.__webTracker__
}

const _global = getWindow()
const _support = getSupport()
const uaResult = new UAParser().getResult()

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
