import {
  EVENTTYPES,
  USERBEHAVIORSTACKTYPES,
  STATUS_CODE,
} from '../../../common'
export interface webTracker {
  deviceInfo: {
    // 设备信息
    [key: string]: any
  }
}

export interface voidFun {
  (...args: any[]): void
}

export interface Callback {
  (...args: any[]): any
}

export interface baseObj {
  [key: string]: any
}

export interface userBehaviorStackType {
  type: EVENTTYPES
  category: USERBEHAVIORSTACKTYPES
  status: STATUS_CODE
  time: number
  data: any
}

export interface HttpData {
  type?: string
  method?: string
  time: number
  url: string // 接口地址
  elapsedTime: number // 接口时长
  message: string // 接口信息
  Status?: number // 接口状态编码
  status?: string // 接口状态
  requestData?: {
    httpType: string // 请求类型 xhr fetch
    method: string // 请求方式
    data: any
  }
  response?: {
    Status: number // 接口状态
    data?: any
  }
}

export interface ResourceTarget {
  src?: string
  href?: string
  localName?: string
}

export interface RouteHistory {
  from: string
  to: string
}

export interface ErrorTarget {
  target?: {
    localName?: string
  }
  error?: any
  message?: string
}

export interface ReplaceHandler {
  type: EVENTTYPES
  callback: Callback
}

export type ReplaceCallback = (...args: any[]) => any

export interface Window {
  chrome: {
    app: {
      [key: string]: any
    }
  }
  history: any
  addEventListener: any
  innerWidth: any
  innerHeight: any
  onpopstate: any
  performance: any
  __webTracker__: {
    [key: string]: any
  }
}

export interface SdkBase {
  transportData: any // 数据上报
  userBehavior: any // 用户行为
  options: any // 公共配置
  notify: any // 发布消息
}

export abstract class BasePlugin {
  public type: string
  constructor(type: string) {
    this.type = type
  }
  abstract bindOptions(options: object): void
  abstract core(sdkBase: SdkBase): void
  abstract transform(data: any): void
}

export interface RecordScreenOption {
  recordScreenTypeList: string[]
  recordScreenTime: number
}
