import { lazyReport } from '../../../utils'

/**
 * @description xhr错误网络请求上报
 */
export function xhrRequestTrackerReport() {
  try {
    const originXhrOpen = XMLHttpRequest.prototype.open
    const originXhrSend = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string,
      ...args: any[]
    ) {
      this._startTime = Date.now()
      this._url = url
      this._method = method
      return originXhrOpen.apply(this, args)
    }

    XMLHttpRequest.prototype.send = function (...args: any[]) {
      this.addEventListener('loadend', () => {
        try {
          const endTime = Date.now()
          const status = this.status
          const response = this.responseText || null
          if (status >= 400) {
            lazyReport({
              kind: 'network-related-events',
              type: 'xhrRequestTrackerReport-statusError',
              params: {
                url: this._url,
                method: this._method,
                status,
                response,
                startTime: this._startTime,
                endTime,
              },
            })
          }
        } catch (error) {
          console.log('xhrRequestTrackerReport中获取xhr状态失败')
          lazyReport({
            kind: 'self-error',
            type: 'xhrRequestTrackerReport-getXhrStatusError',
            params: {
              error,
            },
          })
        }
      })
      return originXhrSend.apply(this, args)
    }
    console.log('xhrRequestTrackerReport初始化完成')
  } catch (error) {
    console.log('xhrRequestTrackerReport初始化失败')
    lazyReport({
      kind: 'self-error',
      type: 'xhrRequestTrackerReport-initError',
      params: {
        error,
      },
    })
  }
}

/**
 * @description fetch请求上报,重写fetch方法，当返回code大于等于400时进行上报
 */
export function fetchRequestTrackerReport() {
  try {
    const originFetch = window.fetch
    window.fetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) {
      try {
        const startTime = Date.now()
        const response = await originFetch(input, init)
        const endTime = Date.now()
        const url = typeof input === 'string' ? input : input.toString()
        const method = init?.method || 'GET'
        const status = response.status
        const responseText = await response.clone().text()
        if (status >= 400) {
          lazyReport({
            kind: 'network-related-events',
            type: 'fetch-error',
            params: {
              url,
              method,
              status,
              responseText,
              startTime,
              endTime,
            },
          })
        }
        return response
      } catch (error) {
        console.log('fetchRequestTrackerReport中获取fetch状态失败')
        lazyReport({
          kind: 'self-error',
          type: 'fetchTrackerReport-getFetchStatusError',
          params: {
            error,
          },
        })
        throw error
      }
    }
    console.log('fetchRequestTrackerReport初始化完成')
  } catch (error) {
    console.log('fetchRequestTrackerReport初始化失败')
    lazyReport({
      kind: 'self-error',
      type: 'fetchRequestTrackerReport-initError',
      params: {
        error,
      },
    })
  }
}
