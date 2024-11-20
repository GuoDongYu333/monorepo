import {
  _support,
  isEmpty,
  Queue,
  validateOptions,
  generateUUID,
  isBrowserENV,
} from '../../../utils'
import { SDK_VERSION, EVENTTYPES } from '../../../common'
import { userBehavior } from './userBehavior'
import { InitOptions } from '../../../types'
import { options } from './options'

/**
 * @description 数据上报   1.初始化uuid 2.绑定信息 3.获取用户信息 4.获取用户id 5.添加公共信息 6.执行上报前的钩子 7.上报
 */
export class TransportData {
  queue: Queue = new Queue() //请求队列
  apiKey = '' // apikey
  transportUrl = '' //上报地址
  userId = '' // 用户id
  uuid: string //唯一标识
  beforeTransport: any //上报前的钩子函数
  getUserId: any //自定义的获取userId的方法
  useImgUpload = false //是否开启图片打点上报
  constructor() {
    this.uuid = generateUUID()
  }

  /**
   * @description 初始化配置
   * @param {InitOptions} options
   * @returns {void}
   */
  bindOptions(options: InitOptions): void {
    const {
      apikey,
      reportUrl,
      userId,
      useImgUpload,
      getUserId,
      beforePushFunc,
    } = options
    if (validateOptions(apikey, 'apikey', 'string')) {
      this.apiKey = apikey
    }
    if (validateOptions(reportUrl, 'reportUrl', 'string')) {
      this.transportUrl = reportUrl
    }
    if (validateOptions(userId, 'userId', 'string')) {
      this.userId = userId!
    }
    if (validateOptions(getUserId, 'getUserId', 'function')) {
      this.getUserId = getUserId
    }
    if (validateOptions(beforePushFunc, 'beforePushFunc', 'function')) {
      this.beforeTransport = beforePushFunc
    }
    if (validateOptions(useImgUpload, 'useImgUpload', 'boolean')) {
      this.useImgUpload = useImgUpload!
    }
  }

  /**
   * @description 获取上报信息
   * @returns {object} 上报信息包括userId sdkVersion apikey
   */
  getAuthInfo() {
    return {
      userId: this.userId || this.getAuthId() || '',
      sdkVersion: SDK_VERSION,
      apikey: this.apiKey,
    }
  }

  /**
   * @description 获取用户id
   * @returns {string | number} 用户id
   */
  getAuthId(): string | number {
    if (typeof this.getUserId === 'function') {
      const id = this.getUserId()
      if (typeof id === 'string' || typeof id === 'number') {
        return id
      } else {
        console.error(
          `webTracker userId: ${id} 期望 string 或 number 类型，但是传入 ${typeof id}`,
        )
      }
    }
    return ''
  }

  /**
   * @description 将自定义上报数据和公信上报数据合并
   * @param {object} data 自定义上报数据
   * @returns {object} 上报数据
   */
  getTransportData(data: any) {
    const info = {
      ...data,
      ...this.getAuthInfo(),
      uuid: this.uuid,
      deviceInfo: _support.deviceInfo,
    }
    const excludeUserBehavior = [
      EVENTTYPES.PERFORMANCE,
      EVENTTYPES.RECORDSCREEN,
      EVENTTYPES.WHITESCREEN,
    ]
    if (!excludeUserBehavior.includes(data.type)) {
      info.userBehavior = userBehavior.getStack()
    }
    return info
  }

  /**
   * @description 在上报前执行预设的钩子函数
   * @param {object} data 上报数据
   * @returns {object | boolean} 钩子函数返回的数据或一个布尔值
   */
  beforePost(this: any, data: any) {
    let transportData = this.getTransportData(data)
    if (typeof this.beforeTransport === 'function') {
      transportData = this.beforeTransport(transportData)
      if (!transportData) return false
    }
    return transportData
  }

  isSDKTransportUrl(targetUrl: string) {
    let isSDK = false
    if (this.transportUrl && targetUrl.indexOf(this.transportUrl) !== -1) {
      isSDK = true
    }
    return isSDK
  }

  beacon(url: string, data: any) {
    return navigator.sendBeacon(url, JSON.stringify(data))
  }
  imgRequest(data: any, url: string) {
    const requestFunc = () => {
      const img = new Image()
      const spliceStr = url.indexOf('?') === -1 ? '?' : '&'
      img.src = `${url}${spliceStr}data=${encodeURIComponent(JSON.stringify(data))}`
    }
    this.queue.addFn(requestFunc)
  }
  fetchRequest(data: any, url: string) {
    const requestFunc = () => {
      fetch(`${url}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    this.queue.addFn(requestFunc)
  }

  /**
   * @description 上报数据，流程：获取上报地址 -> 检查上报地址 -> 处理静默录制屏幕 -> 执行上报前的钩子函数 -> 判断环境 -> 使用 sendBeacon 发送数据 -> 处理发送失败情况
   * @param {object} data 上报数据
   * @returns {Promise<void>} Promise对象
   */
  async send(data: any) {
    const reportUrl = this.transportUrl
    if (isEmpty(reportUrl)) {
      console.error(
        'webTranker: reportUrl为空，没有传入监控错误上报的地址，请在init中传入',
      )
    }
    if (_support.options.silentRecordScreen) {
      if (options.recordScreenTypeList.includes(data.type)) {
        _support.hasError = true
        data.recordScreenId = _support.recordScreenId
      }
    }
    const res = await this.beforePost(data)
    if (isBrowserENV && res) {
      const value = this.beacon(reportUrl, res)
      if (!value) {
        return this.useImgUpload
          ? this.imgRequest(res, reportUrl)
          : this.fetchRequest(res, reportUrl)
      }
    }
  }
}

const transportData =
  _support.transportData || (_support.transportData = new TransportData())
export { transportData }
