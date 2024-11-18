import { EVENTTYPES, USERBEHAVIORSTACKTYPES } from '../../../common'
import type { userBehaviorStackType, InitOptions } from '../../../types'
import { _support, getTimestamp } from '../../../utils'
import { validateOptions } from '../../../utils'
export class userBehaviorCls {
  maxCount = 20
  beforePushFunc: unknown = null
  stack: userBehaviorStackType[]
  constructor() {
    this.stack = []
  }

  /**
   * @description 添加用户行为（在添加前执行钩子函数）
   */
  push(data: userBehaviorStackType) {
    if (typeof this.beforePushFunc === 'function') {
      const result = this.beforePushFunc(data) as userBehaviorStackType
      if (!result) return
      this.immediatePush(result)
      return
    }
    this.immediatePush(data)
  }
  immediatePush(data: userBehaviorStackType) {
    if (!data.time) {
      data.time = getTimestamp()
    }
    if (this.stack.length >= this.maxCount) {
      this.shift()
    }
    this.stack.push(data)
    this.stack.sort((a, b) => a.time - b.time)
  }

  shift(): boolean {
    return this.stack.shift() !== undefined
  }

  clear(): void {
    this.stack = []
  }

  getStack(): userBehaviorStackType[] {
    return this.stack
  }

  getCategory(type: EVENTTYPES): USERBEHAVIORSTACKTYPES {
    switch (type) {
      // 接口请求
      case EVENTTYPES.XHR:
      case EVENTTYPES.FETCH:
        return USERBEHAVIORSTACKTYPES.HTTP

      // 用户点击
      case EVENTTYPES.CLICK:
        return USERBEHAVIORSTACKTYPES.CLICK

      // 路由变化
      case EVENTTYPES.HISTORY:
      case EVENTTYPES.HASHCHANGE:
        return USERBEHAVIORSTACKTYPES.ROUTE

      // 加载资源
      case EVENTTYPES.RESOURCE:
        return USERBEHAVIORSTACKTYPES.RESOURCE

      // Js代码报错
      case EVENTTYPES.UNHANDLEDREJECTION:
      case EVENTTYPES.ERROR:
        return USERBEHAVIORSTACKTYPES.CODEERROR

      // 用户自定义
      default:
        return USERBEHAVIORSTACKTYPES.CUSTOM
    }
  }

  bindOptions(options: InitOptions): void {
    const { maxCount, beforePushFunc } = options
    const isValidMaxCount = validateOptions(maxCount, 'maxCount', 'number')
    if (isValidMaxCount) {
      this.maxCount = maxCount || 20
    }

    const isValidBeforePushFunc = validateOptions(
      beforePushFunc,
      'beforePushFunc',
      'function',
    )
    if (isValidBeforePushFunc) {
      this.beforePushFunc = beforePushFunc
    }
  }
}

const userBehavior =
  _support.userBehavior || (_support.userBehavior = new userBehaviorCls())
export { userBehavior }
