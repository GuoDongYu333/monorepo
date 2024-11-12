export interface reportType {
  //上报类型类型   性能相关事件  错误相关事件  用户行为相关事件  兼容性相关事件
  kind:
    | 'performance-related-Events'
    | 'error-related-events'
    | 'user-behavior-related-events'
    | 'compatibility-related-events'
  type: string
  params: object
}
