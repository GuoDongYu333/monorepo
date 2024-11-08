import { initType, configObject } from '../types'
import { errorTrackerReport } from './common/errorTrackerReport'

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
    // autoTrackerReport()
  }
  if (config.errorReport) {
    errorTrackerReport()
  }
  if (config.isHash) {
    // hashTrackerReport()
  } else {
    // historyTrackerReport()
  }
  return {
    changeConfig,
    getConfig,
  }
}
