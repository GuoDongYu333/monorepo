import type { initType } from '../types'
import { loadingConfig } from './core/utils/utils'
import { report } from './core/utils/report'
import { getCache } from './core/utils/cache'
import type { VueInstance } from '../types/index'

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
