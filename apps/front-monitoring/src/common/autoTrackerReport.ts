import { lazyReport } from './report'
import { getPath, hasNoReportAttribute } from '../utils'

/**
 * @description dom事件自动上报
 */
export function autoTrackerReport() {
  document.body.addEventListener('click', function (e) {
    const clickDom = e.target as Element
    const target = clickDom?.getAttribute('data-target')
    //如果有不需要自动上报，则直接返回
    if (hasNoReportAttribute(clickDom)) {
      return
    }
    if (target) {
      lazyReport('click', {
        action: 'click',
        data: target,
      })
    } else {
      const path = getPath(clickDom)
      lazyReport('click', {
        action: 'click',
        data: path,
      })
    }
  })
}

/**
 * @description dom事件手动上报，可用于阻止冒泡元素的事件上报，也可用来进行除点击事件外的自定义上报
 */
export function trackerReport(acttionType: string, data: object) {
  lazyReport(acttionType, data)
}
