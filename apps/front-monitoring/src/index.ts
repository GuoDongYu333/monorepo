import { getFlag, setFlag, _global } from '../utils'
import type { VueInstance, ViewModel, InitOptions } from '../types'
import {
  handlerOptions,
  setupReplace,
  HandleEvents,
  CustomTracker,
} from './core'
import { EVENTTYPES } from '../common'

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
