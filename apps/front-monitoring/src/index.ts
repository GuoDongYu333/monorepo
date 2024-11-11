import type { initType } from '../types'
import { loadingConfig } from './utils'
import { report } from './common/report'
import { getCache } from './common/cache'

/**
 *
 * @param options 初始化配置信息，注入监控代码
 */
function init(options: initType): void {
  loadingConfig(options)
  //避免卸载前缓存数据丢失
  window.addEventListener('unload', () => {
    const data = getCache()
    report(data)
  })
}

export { init }
