import { initType } from '../types'
import { loadingConfig } from './utils'

/**
 *
 * @param options 初始化配置信息，注入监控代码
 */
function init(options: initType): void {
  loadingConfig(options)
}

export { init }
