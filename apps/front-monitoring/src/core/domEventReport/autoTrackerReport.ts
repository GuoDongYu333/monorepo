import { lazyReport } from '../../../utils/report'
import { getPath, hasNoReportAttribute } from '../utils/utils'
import { autoTrackerReportType } from './autoTrackerReportType'

/**
 * @description dom事件自动上报
 */
export function autoTrackerReport() {
  try {
    for (const event in autoTrackerReportType) {
      const userEvent =
        autoTrackerReportType[event as keyof typeof autoTrackerReportType]
      document.addEventListener(userEvent, (e) => {
        const eventDom = e.target as Element
        const target = eventDom?.getAttribute('data-target')
        if (hasNoReportAttribute(eventDom)) {
          return
        }
        if (target) {
          lazyReport({
            kind: 'user-behavior-related-events',
            type: `user-behavior-${event}`,
            params: {
              data: target,
            },
          })
        } else {
          const path = getPath(eventDom)
          lazyReport({
            kind: 'user-behavior-related-events',
            type: userEvent,
            params: {
              data: path,
            },
          })
        }
      })
    }
    console.log('自动上报DOM事件初始化完成')
  } catch (error) {
    console.log('自动上报DOM事件初始化失败')
    lazyReport({
      kind: 'self-error',
      type: 'autoTrackerReport-initError',
      params: {
        error,
        message: '自动上报DOM事件初始化失败',
      },
    })
    return
  }
}

/**
 * @description dom事件手动上报，可用于阻止冒泡元素的事件上报，也可用来进行除点击事件外的自定义上报
 */
export function trackerReport(acttionType: string, data: object) {
  lazyReport({
    kind: 'user-behavior-related-events',
    type: `user-behavior-${acttionType}`,
    params: {
      data,
    },
  })
}
