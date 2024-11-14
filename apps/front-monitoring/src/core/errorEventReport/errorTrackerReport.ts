import { lazyReport } from '../utils/report'

/**
 * @description 监听错误，自动上报
 */
export function errorTrackerReport(): void {
  try {
    const originErrorHandler = window.onerror

    // 处理普通 JavaScript 错误
    window.onerror = function (message, source, row, col, error) {
      try {
        // 因为可能有原本的 window.onerror，新设置会被覆盖，所以判断一下
        if (originErrorHandler) {
          originErrorHandler.call(window, message, source, row, col, error)
        }
        lazyReport({
          kind: 'error-related-events',
          type: 'Js Error',
          params: {
            message,
            source,
            row,
            col,
            error,
          },
        })
      } catch (error) {
        console.log('JS错误上报启动失败')
        lazyReport({
          kind: 'self-error',
          type: 'errorTrackerReportError-JSErrorCatch',
          params: {
            error,
          },
        })
        return
      }
    }

    // 监听 Promise 错误
    window.addEventListener(
      'unhandledrejection',
      (error: PromiseRejectionEvent) => {
        try {
          lazyReport({
            kind: 'error-related-events',
            type: 'Promise Error',
            params: {
              message: error.reason,
              error,
            },
          })
        } catch (error) {
          console.log('Promise错误上报启动失败')
          lazyReport({
            kind: 'self-error',
            type: 'errorTrackerReportError-PromiseErrorCatch',
            params: {
              error,
            },
          })
          return
        }
      },
    )

    // 监听资源加载错误
    window.addEventListener(
      'error',
      (error: ErrorEvent) => {
        try {
          const target = error.target
          const isElementTarget =
            target instanceof HTMLScriptElement ||
            target instanceof HTMLLinkElement ||
            target instanceof HTMLImageElement

          // 如果是普通 js 错误，不在此处监听
          if (!isElementTarget) {
            return
          }

          lazyReport({
            kind: 'error-related-events',
            type: 'Resource Error',
            params: {
              message: `加载${target.tagName}资源错误`,
              file:
                target instanceof HTMLLinkElement ? target.href : target.src,
              error,
              errorType: 'Resource Error',
            },
          })
        } catch (error) {
          console.log('资源加载错误上报失败')
          lazyReport({
            kind: 'self-error',
            type: 'errorTrackerReportError-ResourceErrorCatch',
            params: {
              error,
            },
          })
          return
        }
      },
      true,
    )

    console.log('错误上报初始化完成')
  } catch (error) {
    console.log('错误上报初始化失败失败')
    lazyReport({
      kind: 'self-error',
      type: 'errorTrackerReportError-initError',
      params: {
        error,
      },
    })
  }
}

/**
 * @description 手动上报错误
 * @param error
 * @param message
 * @return {never}
 *
 */
export function errorCatcher(error: Error, message: string): void {
  lazyReport({
    kind: 'error-related-events',
    type: 'Catch Error',
    params: {
      message,
      error,
    },
  })
}
