import { addCache, getCache, clearCache } from './cache'
import { reportType } from '../../types/index'

let timer: ReturnType<typeof setTimeout>

/**
 * @description 上报
 * @param type 错误的类型，可以自定义或者传优先级什么的？
 * @param params 一系列参数，想传什么传什么
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
