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

export interface Callback {
  (...args: any[]): any
}

export interface baseObj {
  [key: string]: any
}

export interface Window {
  __webTracker__: {
    [key: string]: any
  }
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
