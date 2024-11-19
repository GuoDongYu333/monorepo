import type { initType } from '../types'
import { loadingConfig, report, getCache } from '../utils'
import type { VueInstance } from '../types'
// import { handlerOptions } from './core/core/options'

/**
 *
 * @param options 初始化配置信息，注入监控代码
 */
function init(options: initType): void {
  if (!options.appId || !options.userId || !options.reportUrl) {
    return console.error(
      `系统缺少关键配置，请配置${!options.appId ? 'appId' : ''},${!options.userId ? 'userId' : ''},${!options.reportUrl ? 'reportUrl' : ''}`,
    )
  }

  // handlerOptions(options)
  loadingConfig(options)
  //避免卸载前缓存数据丢失
  window.addEventListener('unload', () => {
    const data = getCache()
    report(data)
  })
}

function install(Vue: VueInstance, options: initType) {
  init(options)
}

export default { init, install }
