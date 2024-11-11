import type { initType, configObject } from '../types'
import { errorTrackerReport } from './common/errorTrackerReport'
import { autoTrackerReport } from './common/autoTrackerReport'
import {
  hashTrackerReport,
  historyTrackerReport,
} from './common/pageTrackerReport'

/**
 *
 * @param {initType} options 初始化配置，例如appId，userId等
 * @return {*} 返回一个对象，包括changeConfig和getConfig方法，用于修改和获取配置
 */
export function loadingConfig(options: initType): configObject {
  const config = {
    appId: options.appId,
    userId: options.userId,
    reportUrl: options.reportUrl,
    autoTracker: options.autoTracker,
    delay: options.delay,
    isHash: options.isHash,
    errorReport: options.errorReport,
  }

  ;(window as any).config = config
  function changeConfig(newConfig: Partial<initType>) {
    Object.assign(config, newConfig)
  }
  function getConfig() {
    return config
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
  return {
    changeConfig,
    getConfig,
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
