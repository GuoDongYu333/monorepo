import type { initType, configObject } from '../../types'
import { errorTrackerReport } from '../../src/core/errorEventReport/errorTrackerReport'
import { autoTrackerReport } from '../../src/core/domEventReport/autoTrackerReport'
import { longTaskTrackerReport } from '../../src/core/performanceEventReport/longTaskTrackerReport'
import { uvTrackerReport } from '../../src/core/visitEventReport/visitToUserTrackerReport'
import {
  xhrRequestTrackerReport,
  fetchRequestTrackerReport,
} from '../../src/core/performanceEventReport/networkRequestTrackerReport'
import {
  hashTrackerReport,
  historyTrackerReport,
} from '../../src/core/changePageEventReport/pageTrackerReport'
import { performanceTrackerReport } from '../../src/core/performanceEventReport/performanceTrackerReport'
import { lazyReport } from './report'

/**
 *
 * @param {initType} options 初始化配置，例如appId，userId等
 * @return {configObject} 返回一个对象，包括changeConfig和getConfig方法，用于修改和获取配置
 */
export function loadingConfig(options: initType): configObject {
  try {
    const config = {
      appId: options.appId,
      userId: options.userId,
      reportUrl: options.reportUrl,
      autoTracker: options.autoTracker,
      delay: options.delay,
      isHash: options.isHash,
      errorReport: options.errorReport,
      recordLongTask: options.recordLongTask,
      recordVisit: options.recordVisit,
      recordNetwork: options.recordNetwork,
      recordFirstScreen: options.recordFirstScreen,
    }

    ;(window as any).config = config
    function changeConfig(newConfig: Partial<initType>) {
      Object.assign(config, newConfig)
    }
    function getConfig() {
      return config
    }
    if (config.recordLongTask) {
      longTaskTrackerReport()
    }
    if (config.recordVisit) {
      uvTrackerReport()
    }
    if (config.autoTracker) {
      autoTrackerReport()
    }
    if (config.errorReport) {
      errorTrackerReport()
    }
    if (config.isHash) {
      hashTrackerReport()
    } else {
      historyTrackerReport()
    }
    if (config.recordNetwork) {
      xhrRequestTrackerReport()
      fetchRequestTrackerReport()
    }
    if (config.recordFirstScreen) {
      performanceTrackerReport()
    }
    console.log('loadingConfig初始化成功')

    return {
      changeConfig,
      getConfig,
    }
  } catch (error) {
    console.log('loadingConfig初始化失败')
    lazyReport({
      kind: 'self-error',
      type: 'loadingConfig-initError',
      params: {
        error,
      },
    })
    return {
      changeConfig: () => {},
      getConfig: () => ({
        appId: '',
        autoTracker: false,
        delay: 0,
        errorReport: false,
        isHash: false,
        recordLongTask: false,
        recordVisit: false,
        reportUrl: '',
        userId: '',
        recordNetwork: false,
      }),
    }
  }
}

/**
 * @description 输入dom元素，返回dom元素处于整体的位置
 * @param {Element} element 需要获取路径的元素
 * @return {string} 返回元素的路径
 */
export function getPath(element: Element) {
  if (element.id !== '') {
    return '//*[@id="' + element.id + '"]'
  }
  if (element === document.body) {
    return element.tagName
  }

  let xId = 0
  const siblings: NodeListOf<ChildNode> | undefined =
    element.parentNode?.childNodes
  if (siblings) {
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i]
      if (sibling === element) {
        return (
          //@ts-ignore
          getPath(element.parentNode) +
          '/' +
          element.tagName +
          '[' +
          (xId + 1) +
          ']'
        )
      }
      if (
        sibling.nodeType === 1 &&
        (sibling as Element).tagName === element.tagName
      ) {
        xId++
      }
    }
  } else {
    return ''
  }
}

/**
 * @description 检查元素及其所有父级元素是否有 data-no-report 属性
 * @param {Element} element 当前元素
 * @returns {boolean} 是否有 data-no-report 属性
 */
export function hasNoReportAttribute(element: Element): boolean {
  let currentElement: Element | null = element
  while (currentElement) {
    if (currentElement.getAttribute('data-no-report')) {
      return true
    }
    currentElement = currentElement.parentElement
    console.log(currentElement)
  }
  return false
}

/**
 * @description 如果页面加载完成或已经处于交互状态，则立即执行回调函数，否则在页面加载完成后再执行
 * @param {Function} callback 回调函数
 */
export function waitLoading(callback: () => any): void {
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    callback()
  } else {
    window.addEventListener('load', callback)
  }
}

export function getLastEvent() {}
