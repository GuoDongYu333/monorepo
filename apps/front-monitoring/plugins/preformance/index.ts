declare global {
  interface Performance {
    memory?: {
      jsHeapSizeLimit?: number
      totalJSHeapSize?: number
      usedJSHeapSize?: number
    }
  }
}

import { EVENTTYPES, STATUS_CODE } from '../../common'
import { BasePlugin, SdkBase } from '../../types'
import { getTimestamp, on, _global } from '../../utils'
import { getWebVitals, getResource } from './core/performance'

export default class WebPerformance extends BasePlugin {
  type: string
  constructor() {
    super(EVENTTYPES.PERFORMANCE)
    this.type = EVENTTYPES.PERFORMANCE
  }
  bindOptions(): void {}
  core({ transportData }: SdkBase) {
    getWebVitals((res) => {
      const { name, rating, value } = res
      transportData.send({
        type: EVENTTYPES.PERFORMANCE,
        status: STATUS_CODE.SUCCESS,
        name,
        rating,
        value,
      })
    })

    const observer = new PerformanceObserver((list) => {
      for (const long of list.getEntries()) {
        // 上报长任务详情
        transportData.send({
          type: EVENTTYPES.PERFORMANCE,
          name: 'longTask',
          longTask: long,
          time: getTimestamp(),
          status: STATUS_CODE.SUCCESS,
        })
      }
    })
    observer.observe({ entryTypes: ['longtask'] })

    on(_global, 'load', function () {
      // 上报资源列表
      transportData.send({
        type: EVENTTYPES.PERFORMANCE,
        name: 'resourceList',
        time: getTimestamp(),
        status: STATUS_CODE.SUCCESS,
        resourceList: getResource(),
      })

      // 上报内存情况, safari、firefox不支持该属性
      if (performance.memory) {
        transportData.send({
          type: EVENTTYPES.PERFORMANCE,
          name: 'memory',
          time: getTimestamp(),
          status: STATUS_CODE.SUCCESS,
          memory: {
            jsHeapSizeLimit:
              performance.memory && performance.memory.jsHeapSizeLimit,
            totalJSHeapSize:
              performance.memory && performance.memory.totalJSHeapSize,
            usedJSHeapSize:
              performance.memory && performance.memory.usedJSHeapSize,
          },
        })
      }
    })
  }

  transform() {}
}
