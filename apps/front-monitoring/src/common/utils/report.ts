import { addCache, getCache, clearCache } from './cache'
import type { reportType } from '../../../types/index'

let timer: ReturnType<typeof setTimeout>

/**
 * @description 上报
 * @param {reportType} params 错误的类型，传入一个kind,一个type，一个params(里面内容自定义)
 * @returns
 */
export function lazyReport(params: reportType) {
  const appId = (window as any).config.appId
  const userId = (window as any).config.userId
  const delay = (window as any).config.delay
  const reportParams = {
    appId,
    userId,
    params,
    currentTime: new Date().getTime(),
    currentPage: window.location.href,
    ua: navigator.userAgent,
  }

  const reportParamsString = JSON.stringify(reportParams)
  addCache(reportParamsString)
  const data = getCache()
  if (delay === 0) {
    report(data)
    return
  }

  if (data.length > 10) {
    report(data)
    clearTimeout(timer)
    return
  }
  clearTimeout(timer)
  timer = setTimeout(() => {
    report(data)
  }, delay)
}

/**
 * @description 上报数据，为了避免跨域，使用navigator.sendBeacon或者图片上报
 * @param {string[]} data 上报的数据
 */
export function report(data: string[]) {
  const url = (window as any).config.reportUrl
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, JSON.stringify(data))
  } else {
    const reprotImg = new Image()
    reprotImg.src = `${url}?data=${data}`
  }
  clearCache()
}
