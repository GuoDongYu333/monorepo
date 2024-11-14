import type { historyEventName, hashEventName } from '../../../types/index'
import { lazyReport } from '../utils/report'
/**
 * @description hsitory路由模式下页面切换上报
 */
export function historyTrackerReport(): void {
  try {
    let beforeTime = Date.now()
    let beforePagePath = ''

    /**
     * @description 获取停留时间
     * @returns 停留时间
     */
    function getStayTime(): number {
      try {
        const curTime = Date.now()
        const stayTime = curTime - beforeTime
        beforeTime = curTime
        return stayTime
      } catch (error) {
        console.log('historyTrackerReport中获取停留时间失败')
        lazyReport({
          kind: 'self-error',
          type: 'historyTrackerReport-getStayTimeError',
          params: {
            error,
          },
        })
        return 0
      }
    }

    /**
     *
     * @param {T extends historyEventName} name 事件名称应为pushState或replaceState
     * @returns 返回一个函数
     */
    function changeHistoryEvent<T extends historyEventName>(
      name: T,
    ): (...args: any[]) => any {
      const origin = window.history[name]
      return function (...args: any[]): any {
        try {
          const res = origin.apply(this, args)
          const e = new Event(name)
          // @ts-ignore
          e.arguments = args
          window.dispatchEvent(e)
          return res
        } catch (error) {
          console.log('historyTrackerReport中changeHistoryEvent失败')
          lazyReport({
            kind: 'self-error',
            type: 'historyTrackerReport-changeHistoryEventError',
            params: {
              error,
            },
          })
          return null
        }
      }
    }

    /**
     * @description 数据上报并记录当前页面，以便在离开时上报
     */
    function listener(): void {
      try {
        const stayTime = getStayTime()
        const curPagePath = window.location.href
        lazyReport({
          kind: 'user-behavior-related-events',
          type: 'historychange',
          params: {
            stayTime,
            page: beforePagePath,
          },
        })
        beforePagePath = curPagePath
      } catch (error) {
        console.log('historyTrackerReport中listener失败')
        lazyReport({
          kind: 'self-error',
          type: 'historyTrackerReportError-listenerError',
          params: {
            error,
          },
        })
      }
    }

    try {
      window.addEventListener('pushState', function () {
        listener()
      })

      window.addEventListener('replaceState', function () {
        listener()
      })

      window.history.pushState = changeHistoryEvent('pushState')
      window.history.replaceState = changeHistoryEvent('replaceState')

      // 页面load监听
      window.addEventListener('load', function () {
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
    } catch (error) {
      console.log('historyTrackerReport中启动监听失败')
      lazyReport({
        kind: 'self-error',
        type: 'historyTrackerReportError-eventListenerError',
        params: {
          error,
        },
      })
    }
    console.log('historyTrackerReport初始化完成')
  } catch (error) {
    console.log('historyTrackerReport初始化失败')
    lazyReport({
      kind: 'self-error',
      type: 'historyTrackerReportError-initError',
      params: {
        error,
      },
    })
  }
}

/**
 * @description hash路由模式下页面切换上报
 */
export function hashTrackerReport(): void {
  try {
    let beforeTime = Date.now()
    let beforePagePath = ''

    /**
     * @description 获取停留时间
     * @returns 停留时间
     */
    function getStayTime(): number {
      try {
        const curTime = Date.now()
        const stayTime = curTime - beforeTime
        beforeTime = curTime
        return stayTime
      } catch (error) {
        // console.error('Error in getStayTime:', err);
        console.log('hashTrackerReport中获取停留时间失败')
        lazyReport({
          kind: 'self-error',
          type: 'hashTrackerReport-getStayTimeError',
          params: { error },
        })
        return 0
      }
    }

    /**
     * @description 修改hash事件的处理函数
     * @param {T extends hashEventName} name 事件名称应为hashchange
     * @returns 返回一个函数
     */
    function changeHashEvent<T extends hashEventName>(
      name: T,
    ): (...args: any[]) => any {
      const origin = window.history[name]
      return function (...args: any[]): any {
        try {
          const res = origin.apply(this, args)
          const e = new Event(name)
          // @ts-ignore
          e.arguments = args
          window.dispatchEvent(e)
          return res
        } catch (error) {
          console.log('hashTrackerReport中changeHashEvent失败')
          lazyReport({
            kind: 'self-error',
            type: 'hashTrackerReport-changeHashEventError',
            params: { error },
          })
          return null
        }
      }
    }

    /**
     * @description 数据上报并记录当前页面，以便在离开时上报
     */
    function listener(): void {
      try {
        const stayTime = getStayTime()
        const curPagePath = window.location.href
        lazyReport({
          kind: 'user-behavior-related-events',
          type: 'hashchange',
          params: {
            stayTime,
            page: beforePagePath,
          },
        })
        beforePagePath = curPagePath
      } catch (error) {
        console.log('hashTrackerReport中listener错误')
        lazyReport({
          kind: 'self-error',
          type: 'hashTrackerReport-listenerError',
          params: {
            error,
          },
        })
      }
    }

    try {
      window.addEventListener('pushState', function () {
        listener()
      })

      window.history.pushState = changeHashEvent('pushState')

      // 页面load监听
      window.addEventListener('load', function () {
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
    } catch (error) {
      console.log('hashTrackerReport中监听错误')
      lazyReport({
        kind: 'self-error',
        type: 'hashTrackerReport-eventListenerError',
        params: { error },
      })
    }
    console.log('hashTrackerReport初始化完成')
  } catch (error) {
    console.log('hashTrackerReport初始化失败')
    lazyReport({
      kind: 'self-error',
      type: 'hashTrackerReport-initError',
      params: { error },
    })
  }
}
