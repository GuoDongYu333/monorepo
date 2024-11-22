import { lazyReport } from '../../../utils'
import { waitLoading } from '../../../utils'

export function performanceTrackerReport() {
  console.log('进来了111')

  let LCP, FP, FCP

  try {
    // 增加一个性能条目的观察者
    new PerformanceObserver((entryList, observer) => {
      const perfEntries = entryList.getEntries()
      console.log(222333)
      const lastEntry = perfEntries[perfEntries.length - 1]
      LCP = lastEntry
      observer.disconnect() // 不再观察了
    }).observe({ entryTypes: ['largest-contentful-paint'] }) // 观察页面中最大的元素

    new PerformanceObserver((entryList, observer) => {
      const entries = entryList.getEntries()
      console.log(33333)
      FP = entries[0]
      FCP = entries[1]
      observer.disconnect()
    }).observe({ entryTypes: ['paint'] })
    console.log('PerformanceObserver初始化完成')
  } catch (error) {
    console.error('PerformanceObserver 初始化错误:', error)
    lazyReport({
      kind: 'self-error',
      type: 'performanceTrackerReport-initError',
      params: {
        error,
      },
    })
  }

  waitLoading(() => {
    setTimeout(() => {
      try {
        const {
          startTime,
          connectStart,
          connectEnd,
          requestStart,
          responseStart,
          responseEnd,
          domInteractive,
          domContentLoadedEventStart,
          domContentLoadedEventEnd,
          domComplete,
        } = window.performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming

        const performanceData = {
          connectTime: connectEnd - connectStart, // TCP 连接耗时
          ttfbTime: responseStart - requestStart, // 首字节到达时间
          responseTime: responseEnd - responseStart, // response 响应耗时
          parseDOMTime: domComplete - domInteractive, // DOM 解析渲染的时间
          domContentLoadedTime:
            domContentLoadedEventEnd - domContentLoadedEventStart, // DOMContentLoaded 事件回调耗时
          timeToInteractive: domInteractive - startTime, // 首次可交互时间
          loadTime: domComplete - startTime, // 页面完全加载时间
          LCP,
          FP,
          FCP,
        }

        try {
          lazyReport({
            kind: 'performance-related-Events',
            type: 'performanceTrackerReport-performanceData',
            params: {
              ...performanceData,
            },
          })
        } catch (error) {
          console.error('性能数据上报错误:', error)
        }
      } catch (error) {
        lazyReport({
          kind: 'self-error',
          type: 'performanceTrackerReport-getPerformanceDataError',
          params: {
            error,
          },
        })
        console.error('性能数据获取和计算错误:', error)
      }
    }, 3000)
  })
}
