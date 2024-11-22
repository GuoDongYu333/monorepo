declare global {
  interface Navigator {
    connection?: NetworkInformation
  }

  interface NetworkInformation {
    downlink?: number
    effectiveType?: string
    rtt?: number
    saveData?: boolean
    type?: string
  }
}

import { lazyReport } from '../../../utils'

/**
 * @description 用户访问上报（uv）
 */
export function uvTrackerReport(): void {
  try {
    const connection = navigator.connection
    const startTime = Date.now()

    if (connection) {
      const data = {
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        saveData: connection.saveData,
        type: connection.type,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
      }

      try {
        lazyReport({
          kind: 'visitToUser-related-events',
          type: 'network-tracker',
          params: data,
        })
      } catch (error) {
        // console.error('Error in network-tracker report:', err)
        console.log('用户访问上报失败')
        lazyReport({
          kind: 'self-error',
          type: 'uvTrackerReport-uvError',
          params: { error },
        })
      }

      window.addEventListener('beforeunload', () => {
        try {
          const stayTime = Date.now() - startTime
          lazyReport({
            kind: 'visitToUser-related-events',
            type: 'stay-time',
            params: {
              stayTime,
            },
          })
        } catch (error) {
          console.log('离开页面上报失败')
          lazyReport({
            kind: 'self-error',
            type: 'uvTrackerReport-leavePageError',
            params: {
              error,
            },
          })
        }
      })
      console.log('uv上报初始化完成')
    }
  } catch (error) {
    console.log('uv上报初始化失败')
    lazyReport({
      kind: 'self-error',
      type: 'uvTrackerReport-initError',
      params: {
        error,
      },
    })
  }
}
