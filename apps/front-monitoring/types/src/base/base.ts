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
