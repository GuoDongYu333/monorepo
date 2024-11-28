import type { Callback } from '../../../types'
import { on } from '../../../utils'
import { _global } from '../../../utils'
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals'

// firstScreenPaint为首屏加载时间
let firstScreenPaint = 0
// 页面是否渲染完成
let isOnLoaded = false
let timer: number
let observer: MutationObserver
let entries: any[] = []

/**
 * @description 判断是否是safari浏览器
 * @returns {boolean} 是否是safari浏览器
 */
export function isSafari(): boolean {
  return (
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  )
}

/**
 * @description 获取FID(First Input Delay)
 * @param callback 回调函数
 */
export function getFID(callback: Callback): void {
  const entryHandler = (entryList: any) => {
    for (const entry of entryList.getEntries()) {
      observer.disconnect()
      const value = entry.processingStart - entry.startTime
      callback({
        name: 'FID',
        value,
        rating: value > 100 ? 'poor' : 'good',
        entries: [entry],
      })
    }
  }
  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'first-input', buffered: true })
}

/**
 * @description 获取FCP(First Contentful Paint)
 * @param callback 回调函数
 */
export function getFCP(callback: Callback): void {
  const entryHandler = (entryList: any) => {
    for (const entry of entryList.getEntries()) {
      observer.disconnect()
      const value = entry.startTime
      callback({
        name: 'FCP',
        value,
        rating: entry.startTime > 2500 ? 'poor' : 'good',
        entries: [entry],
      })
    }
  }
  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'paint', buffered: true })
}

/**
 * @description 获取LCP(Largest Contentful Paint)
 * @param callback 回调函数
 */
export function getLCP(callback: Callback): void {
  const entryHandler = (list: any) => {
    for (const entry of list.getEntries()) {
      observer.disconnect()
      callback({
        name: 'LCP',
        value: entry.startTime,
        rating: entry.startTime > 2500 ? 'poor' : 'good',
      })
    }
  }
  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'largest-contentful-paint', buffered: true })
}

/**
 * @description 获取CLS(Cumulative Layout Shift)
 * @param callback 回调函数
 */
export function getCLS(callback: Callback): void {
  let clsValue = 0
  // let clsEntries = [];

  let sessionValue = 0
  let sessionEntries: any[] = []

  const entryHandler = (entryList: any) => {
    for (const entry of entryList.getEntries()) {
      // 只将不带有最近用户输入标志的布局偏移计算在内。
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0]
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1]
        // 如果条目与上一条目的相隔时间小于 1 秒且
        // 与会话中第一个条目的相隔时间小于 5 秒，那么将条目
        // 包含在当前会话中。否则，开始一个新会话。
        if (
          sessionValue &&
          entry.startTime - lastSessionEntry.startTime < 1000 &&
          entry.startTime - firstSessionEntry.startTime < 5000
        ) {
          sessionValue += entry.value
          sessionEntries.push(entry)
        } else {
          sessionValue = entry.value
          sessionEntries = [entry]
        }

        // 如果当前会话值大于当前 CLS 值，
        // 那么更新 CLS 及其相关条目。
        if (sessionValue > clsValue) {
          clsValue = sessionValue
          // clsEntries = sessionEntries;
          observer.disconnect()

          callback({
            name: 'CLS',
            value: clsValue,
            rating: clsValue > 2500 ? 'poor' : 'good',
          })
        }
      }
    }
  }

  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'layout-shift', buffered: true })
}

/**
 * @description 获取TTFB(Time to First Byte)
 * @param callback 回调函数
 */
export function getTTFB(callback: Callback): void {
  on(_global, 'load', function () {
    const { responseStart, navigationStart } = _global.performance.timing
    const value = responseStart - navigationStart
    callback({
      name: 'TTFB',
      value,
      rating: value > 100 ? 'poor' : 'good',
    })
  })
}

function getRenderTime(): number {
  let startTime = 0
  entries.forEach((entry) => {
    if (entry.startTime > startTime) {
      startTime = entry.startTime
    }
  })
  // performance.timing.navigationStart 页面的起始时间
  return startTime - performance.timing.navigationStart
}

/**
 * @description 监听 DOM 节点变化，当 DOM 节点发生变化时，触发回调函数
 * @param {Callback} callback 回调函数
 */
function checkDOMChange(callback: Callback) {
  cancelAnimationFrame(timer)
  timer = requestAnimationFrame(() => {
    if (document.readyState === 'complete') {
      isOnLoaded = true
    }
    if (isOnLoaded) {
      // 取消监听
      if (observer) {
        observer.disconnect()
      }
      // document.readyState === 'complete'时，计算首屏渲染时间
      firstScreenPaint = getRenderTime()
      entries = []
      if (callback) {
        callback(firstScreenPaint)
      }
    } else {
      checkDOMChange(callback)
    }
  })
}

const viewportWidth = _global.innerWidth
const viewportHeight = _global.innerHeight
/**
 * @description 判断元素是否在可视范围内
 * @param {HTMLElement} dom 元素
 * @returns {boolean} 是否在可视范围内
 */
function isInScreen(dom: HTMLElement): boolean {
  const rectInfo = dom.getBoundingClientRect()
  if (rectInfo.left < viewportWidth && rectInfo.top < viewportHeight) {
    return true
  }
  return false
}

export function observerFristScreenPaint(callback: Callback): void {
  const ignoreDOMList = ['STYLE', 'SCRIPT', 'LINK']
  observer = new MutationObserver((mutationList: any) => {
    checkDOMChange(callback)
    const entry = { children: [], startTime: 0 }
    for (const mutation of mutationList) {
      if (mutation.addedNodes.length && isInScreen(mutation.target)) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && !ignoreDOMList.includes(node.nodeName)) {
            entry.children.push(node as never)
          }
        }
      }
    }

    if (entry.children.length) {
      entries.push(entry)
      entry.startTime = new Date().getTime()
    }
  })

  observer.observe(document, {
    childList: true, // 监听添加或删除子节点
    subtree: true, // 监听整个子树
    characterData: true, // 监听元素的文本是否变化
    attributes: true, // 监听元素的属性是否变化
  })
}

/**
 * @description 获取首屏渲染时间
 * @param {function} callback - 回调函数获取首屏渲染时间
 */
export function getFirstScreenPaint(callback: Callback): void {
  if ('requestIdleCallback' in _global) {
    requestIdleCallback((deadline) => {
      if (deadline.timeRemaining() > 0) {
        observerFristScreenPaint(callback)
      }
    })
  } else {
    observerFristScreenPaint(callback)
  }
}

/**
 * @description
 * @param callback 回调函数
 */
export function getWebVitals(callback: Callback): void {
  if (isSafari()) {
    getFID((res) => {
      callback(res)
    })
    getFCP((res) => {
      callback(res)
    })
    getLCP((res) => {
      callback(res)
    })
    getCLS((res) => {
      callback(res)
    })
    getTTFB((res) => {
      callback(res)
    })
  } else {
    onINP((res) => {
      callback(res)
    })
    onLCP((res) => {
      callback(res)
    })
    onCLS((res) => {
      callback(res)
    })
    onTTFB((res) => {
      callback(res)
    })
    onFCP((res) => {
      callback(res)
    })
  }

  getFirstScreenPaint((res) => {
    const data = {
      name: 'FSP',
      value: res,
      rating: res > 2500 ? 'poor' : 'good',
    }
    callback(data)
  })
}

/**
 * @description 判断是否是缓存请求
 * @param {PerformanceResourceTiming} entry
 */
export function isCache(entry: PerformanceResourceTiming): boolean {
  return (
    //如果是在缓存中获取的完全没有与服务器通信，则transferSize为0.   如果transferSize为0且encodedBodySize不为0则说明是缓存但是和服务器通信了
    entry.transferSize === 0 ||
    (entry.transferSize !== 0 && entry.encodedBodySize === 0)
  )
}

/**
 * @description 获取所有的资源加载时间
 */
export function getResource(): PerformanceResourceTiming[] {
  const entries = performance.getEntriesByType('resource')
  let list = entries.filter((entry) => {
    return (
      ['fetch', 'xmlhttprequest', 'beacon'].indexOf(entry.initiatorType) === -1
    )
  })
  if (list.length) {
    list = JSON.parse(JSON.stringify(list))
    list.forEach((entry: any) => {
      entry.isCache = isCache(entry)
    })
  }
  return list
}
