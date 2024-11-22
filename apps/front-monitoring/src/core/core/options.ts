import type { InitOptions } from '../../../types'
import { _support, setSilentFlag, validateOptions } from '../../../utils'
import { transportData } from './reportData'
import { userBehavior } from './userBehavior'

export class Options {
  transportUrl = '' //监控请求
  throttleDelayTime = 0 //节流延迟
  overTime = 10 //超时时间
  whiteBoxElements: string[] = ['html', 'body', '#app', '#root'] // // 白屏检测的容器列表
  silentWhiteScreen = false // 是否开启白屏检测
  skeletonProject = false // 项目是否有骨架屏
  filterXhrUrlRegExp: any // 过滤的接口请求正则
  handleHttpStatus: any // 处理接口返回的 response
  repeatCodeError = false // 是否去除重复的代码错误，重复的错误只上报一次
  constructor() {}
  /**
   * @description 初始化配置
   * @param options 初始化配置
   */
  bindOptions(options: InitOptions) {
    const {
      reportUrl,
      filterXhrUrlRegExp,
      throttleDelayTime = 0,
      overTime = 10,
      silentWhiteScreen = false,
      whiteBoxElements = ['html', 'body', '#app', '#root'],
      skeletonProject = false,
      handleHttpStatus,
      repeatCodeError = false,
    } = options
    if (validateOptions(reportUrl, 'reportUrl', 'string')) {
      this.transportUrl = reportUrl
    }
    if (validateOptions(filterXhrUrlRegExp, 'filterXhrUrlRegExp', 'regexp')) {
      this.filterXhrUrlRegExp = filterXhrUrlRegExp
    }
    if (validateOptions(throttleDelayTime, 'throttleDelayTime', 'number')) {
      this.throttleDelayTime = throttleDelayTime
    }
    if (validateOptions(overTime, 'overTime', 'number')) {
      this.overTime = overTime
    }
    if (validateOptions(silentWhiteScreen, 'silentWhiteScreen', 'boolean')) {
      this.silentWhiteScreen = silentWhiteScreen
    }
    if (validateOptions(whiteBoxElements, 'whiteBoxElements', 'array')) {
      this.whiteBoxElements = whiteBoxElements
    }
    if (validateOptions(skeletonProject, 'skeletonProject', 'boolean')) {
      this.skeletonProject = skeletonProject
    }
    if (validateOptions(handleHttpStatus, 'handleHttpStatus', 'function')) {
      this.handleHttpStatus = handleHttpStatus
    }
    if (validateOptions(repeatCodeError, 'repeatCodeError', 'boolean')) {
      this.repeatCodeError = repeatCodeError
    }
  }
}

const options = _support.options || (_support.options = new Options())

/**
 * @description
 * 使用setSilentFlag给replaceFlag添加初始化=标志，防止重复初始化，使用 options 配置初始化配置，使用transportData.bindOptions初始化上传配置，使用userBehavior.bindOptions初始化用户行为栈配置
 * @param {InitOptions} paramsOptions
 * @return {void}
 */
export function handlerOptions(paramsOptions: InitOptions): void {
  setSilentFlag(paramsOptions)
  options.bindOptions(paramsOptions)
  transportData.bindOptions(paramsOptions)
  userBehavior.bindOptions(paramsOptions)
}

export { options }
