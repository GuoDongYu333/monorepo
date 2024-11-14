export interface initType {
  appId: string
  userId: string
  //请求的接口
  reportUrl: string
  //是否开启自动埋点
  autoTracker: boolean
  //是否开启延时合并上报
  delay: number
  //是否是hash路由
  isHash: boolean
  //是否开启错误监控
  errorReport: boolean
  //是否开启长任务性能监控
  recordLongTask: boolean
  //是否开启访问量统计
  recordVisit: boolean
  //是否开启网络请求监控
  recordNetwork: boolean
  //是否开启白屏监控
  recordBlankScreenClassOrId?: Array<string>
}

export interface configObject {
  changeConfig: (newConfig: Partial<initType>) => void
  getConfig: () => initType
}
