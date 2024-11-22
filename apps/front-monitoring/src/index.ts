import {
  // loadingConfig,
  // report,
  // getCache,
  getFlag,
  setFlag,
  _global,
} from '../utils'
import type { VueInstance, ViewModel, InitOptions } from '../types'
import { handlerOptions } from './core/core/options'
import { setupReplace } from './core/core/setupReplace'
import { EVENTTYPES } from '../common'
import { HandleEvents } from './core/core/handleEvents'
import { CustomTracker } from './core/core/customTracker'

/**
 *
 * @param options 初始化配置信息，注入监控代码
 */
// function init(options: initType): void {
//   if (!options.appId || !options.userId || !options.reportUrl) {
//     return console.error(
//       `系统缺少关键配置，请配置${!options.appId ? 'appId' : ''},${!options.userId ? 'userId' : ''},${!options.reportUrl ? 'reportUrl' : ''}`,
//     )
//   }

//   // handlerOptions(options)

//   loadingConfig(options)
//   //避免卸载前缓存数据丢失
//   window.addEventListener('unload', () => {
//     const data = getCache()
//     report(data)
//   })
// }

function init(options: InitOptions): void {
  if (!options.apikey || !options.userId || !options.reportUrl) {
    return console.error(
      `系统缺少关键配置，请配置${!options.apikey ? 'appId' : ''},${!options.userId ? 'userId' : ''},${!options.reportUrl ? 'reportUrl' : ''}`,
    )
  }
  if (!('fetch' in _global) || options.disabled) return

  handlerOptions(options)
  setupReplace()
}

function install(Vue: VueInstance, options: InitOptions) {
  if (getFlag(EVENTTYPES.VUE)) return
  setFlag(EVENTTYPES.VUE, true)
  const handler = Vue.config.errorHandler
  // vue项目在Vue.config.errorHandler中上报错误
  Vue.config.errorHandler = function (
    err: Error,
    vm: ViewModel,
    info: string,
  ): void {
    console.log(err)
    HandleEvents.handleError(err)
    if (handler) handler.apply(null, [err, vm, info])
  }
  init(options)
}

export default { init, install, CustomTracker }
