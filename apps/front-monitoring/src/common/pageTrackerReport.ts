import type { historyEventName, hashEventName } from '../../types/index'
import { lazyReport } from './report'
/**
 * @description hsitory路由模式下页面切换上报
 */
export function historyTrackerReport() {
  let beforeTime = Date.now()
  let beforePagePath = ''

  /**
   * @description 获取停留时间
   * @returns 停留时间
   */
  function getStayTime() {
    const curTime = Date.now()
    const stayTime = curTime - beforeTime
    beforeTime = curTime
    return stayTime
  }

  /**
   *
   * @param {T extends historyEventName} name 事件名称应为pushState或replaceState
   * @returns 返回一个函数
   */
  function changeHistoryEvent<T extends historyEventName>(name: T) {
    const origin = window.history[name]
    return function (...args: any[]) {
      const res = origin.apply(this, args)
      const e = new Event(name)
      //@ts-ignore
      e.arguments = args
      window.dispatchEvent(e)
      return res
    }
  }

  /**
   * @description 数据上报并记录当前页面，以便在离开时上报
   */
  function listener() {
    const stayTime = getStayTime()
    const curPagePath = window.location.href
    lazyReport('visit', {
      stayTime,
      page: beforePagePath,
    })
    beforePagePath = curPagePath
  }

  window.addEventListener('pushState', function () {
    listener()
  })

  // history.replaceState
  window.addEventListener('replaceState', function () {
    listener()
  })

  window.history.pushState = changeHistoryEvent('pushState')
  window.history.replaceState = changeHistoryEvent('replaceState')

  // 页面load监听
  window.addEventListener('load', function () {
    // beforePage = location.href;
    listener()
  })

  // unload监听
  window.addEventListener('unload', function () {
    listener()
  })

  // history.go()、history.back()、history.forward() 监听
  window.addEventListener('popstate', function () {
    listener()
  })
}

/**
 * @description hash路由模式下页面切换上报
 */
export function hashTrackerReport() {
  let beforeTime = Date.now()
  let beforePagePath = ''

  /**
   * @description 获取停留时间
   * @returns 停留时间
   */
  function getStayTime() {
    const curTime = Date.now()
    const stayTime = curTime - beforeTime
    beforeTime = curTime
    return stayTime
  }

  /**
   *
   * @param {T extends historyEventName} name 事件名称应为pushState
   * @returns 返回一个函数
   */
  function changeHashEvent<T extends hashEventName>(name: T) {
    const origin = window.history[name]
    return function (...args: any[]) {
      const res = origin.apply(this, args)
      const e = new Event(name)
      //@ts-ignore
      e.arguments = args
      window.dispatchEvent(e)
      return res
    }
  }

  /**
   * @description 数据上报并记录当前页面，以便在离开时上报
   */
  function listener() {
    const stayTime = getStayTime()
    const curPagePath = window.location.href
    lazyReport('visit', {
      stayTime,
      page: beforePagePath,
    })
    beforePagePath = curPagePath
  }

  window.addEventListener('pushState', function () {
    listener()
  })

  window.history.pushState = changeHashEvent('pushState')

  // 页面load监听
  window.addEventListener('load', function () {
    // beforePage = location.href;
    listener()
  })

  // unload监听
  window.addEventListener('unload', function () {
    listener()
  })

  // hash路由监听
  window.addEventListener('hashchange', function () {
    listener()
  })
}
