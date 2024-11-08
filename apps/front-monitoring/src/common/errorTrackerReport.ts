import { lazyReport } from './report'

/**
 * @description 监听错误，自动上报
 */
export function errorTrackerReport(): void {
  const originErrorHandler = window.onerror
  window.onerror = function (message, source, row, col, error) {
    //因为可能有原本的window.onerror，新设置会被覆盖，所以判断一下
    if (originErrorHandler) {
      originErrorHandler.call(window, message, source, row, col, error)
    }
    lazyReport('error', {
      message,
      source,
      row,
      col,
      error,
      errorType: 'JS Error',
    })
  }
  //监听Promise错误
  window.addEventListener(
    'unhandledrejection',
    (error: PromiseRejectionEvent) => {
      lazyReport('error', {
        message: error.reason,
        error,
        errorType: 'Promise Error',
      })
    },
  )
  //监听资源加载错误
  window.addEventListener(
    'error',
    (error: ErrorEvent) => {
      const target = error.target
      const isElementTarget =
        target instanceof HTMLScriptElement ||
        target instanceof HTMLLinkElement ||
        target instanceof HTMLImageElement
      //如果是普通js错误，不在此处监听
      if (!isElementTarget) {
        return
      }
      lazyReport('error', {
        message: `加载${target.tagName}资源错误`,
        file: target instanceof HTMLLinkElement ? target.href : target.src,
        error,
        errorType: 'Resource Error',
      })
    },
    true,
  )
}

/**
 * @description 手动上报错误
 * @param error
 * @param message
 * @return {never}
 *
 */
export function errorCatcher(error: Error, message: string): void {
  lazyReport('error', {
    message,
    error,
    errorType: 'Catch Error',
  })
}
