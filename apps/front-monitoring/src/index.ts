import { getFlag, setFlag, _global, tryCatch } from '../utils'
import {} from './core'
import type { VueInstance, ViewModel, InitOptions } from '../types'
import {
  handlerOptions,
  setupReplace,
  HandleEvents,
  CustomTracker,
  subscribeEvent,
  transportData,
  userBehavior,
  options,
  notify,
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

function use(plugin: any, option: any) {
  const instance = new plugin(option)
  if (
    !subscribeEvent({
      callback: (data) => {
        instance.transform(data)
      },
      type: instance.type,
    })
  )
    return
  tryCatch(() => {
    instance.core({ transportData, userBehavior, options, notify })
  })
}

export default { init, install, CustomTracker, use }
