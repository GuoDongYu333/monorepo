export interface initType {
  appId: string
  userId: string
  //请求的接口
  reportUrl: string
  //是否开启自动埋点
  autoTracker: boolean
  //是否开启延时合并上报
  delay: boolean
  //是否是hash路由
  isHash: boolean
  //是否开启错误监控
  errorReport: boolean
}

export interface configObject {
  changeConfig: (newConfig: Partial<initType>) => void
  getConfig: () => initType
}
