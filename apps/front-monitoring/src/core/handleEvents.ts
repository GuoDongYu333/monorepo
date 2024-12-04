import { EVENTTYPES, STATUS_CODE } from '../../common'
import type { HttpData, RouteHistory, ErrorTarget } from '../../types'
import { options } from './options'
import { httpTransform, resourceTransform } from './transfromData'
import { userBehavior } from './userBehavior'
import { transportData } from './reportData'
import { openWhiteScreen } from './whiteScreen'
import {
  getTimestamp,
  parseUrlToObj,
  getErrorUid,
  hashMapExist,
} from '../../utils'
import ErrorStackParser from 'error-stack-parser'

const HandleEvents = {
  /**
   * @description 重写各种http请求
   * @param data 一个类型为HttpData的对象
   * @param type EVENTTYPES中的属性表示事件类型
   */
  handleHttp(data: HttpData, type: EVENTTYPES): void {
    const res = httpTransform(data)
    if (!data.url.includes(options.transportUrl)) {
      userBehavior.push({
        type,
        category: userBehavior.getCategory(type),
        data: res,
        status: res.status,
        time: data.time,
      })
    }
    if (res.status === 'error') {
      transportData.send({ ...res, type, status: STATUS_CODE.ERROR })
    }
  },

  /**
   * @description 处理history路由变化
   * @param data 一个类型为RouteHistory的对象
   */
  handleHistory(data: RouteHistory): void {
    const { from, to } = data
    const { relative: parsedFrom } = parseUrlToObj(from)
    const { relative: parsedTo } = parseUrlToObj(to)
    userBehavior.push({
      type: EVENTTYPES.HISTORY,
      category: userBehavior.getCategory(EVENTTYPES.HISTORY),
      data: {
        from: parsedFrom,
        to: parsedTo,
      },
      time: getTimestamp(),
      status: STATUS_CODE.SUCCESS,
    })
  },

  /**
   * @description 处理hash变化
   * @param data 一个类型为HashChangeEvent的对象
   */
  handleHashChange(data: HashChangeEvent): void {
    const { oldURL, newURL } = data
    const { relative: from } = parseUrlToObj(oldURL)
    const { relative: to } = parseUrlToObj(newURL)
    if (oldURL !== newURL) {
      userBehavior.push({
        type: EVENTTYPES.HASHCHANGE,
        category: userBehavior.getCategory(EVENTTYPES.HASHCHANGE),
        data: {
          from,
          to,
        },
        time: getTimestamp(),
        status: STATUS_CODE.SUCCESS,
      })
    }
  },

  //OK
  /**
   * @description 处理promise未处理的异常
   * @param ev 一个类型为PromiseRejectionEvent的对象
   */
  handleUnhandleRejection(ev: PromiseRejectionEvent): void {
    try {
      const stack = ErrorStackParser.parse(ev.reason)[0]
      const { fileName, lineNumber, columnNumber } = stack
      const message = ev.reason.message || ev.reason.stack
      const data = {
        type: EVENTTYPES.UNHANDLEDREJECTION,
        status: STATUS_CODE.ERROR,
        time: getTimestamp(),
        message,
        fileName,
        line: lineNumber,
        column: columnNumber,
      }
      userBehavior.push({
        type: EVENTTYPES.UNHANDLEDREJECTION,
        category: userBehavior.getCategory(EVENTTYPES.UNHANDLEDREJECTION),
        status: STATUS_CODE.ERROR,
        time: getTimestamp(),
        data,
      })
      const hash = getErrorUid(
        `${EVENTTYPES.UNHANDLEDREJECTION}-${message}-${fileName}-${columnNumber}`,
      )
      if (
        !options.repeatCodeError ||
        (options.repeatCodeError && !hashMapExist(hash))
      ) {
        transportData.send(data)
      }
    } catch (error) {
      console.log('出错了', error)
    }
  },

  //OK
  /**
   * @description 错误处理，如果是vue则在errorHandler中处理，react则在componentDidCatch中处理，否则window.onerror
   * @param ev 一个类型为ErrorTarget的对象
   */
  handleError(ev: ErrorTarget): void {
    const target = ev.target
    if (!target || (ev.target && !ev.target.localName)) {
      const stack = ErrorStackParser.parse(!target ? ev : ev.error)[0]
      const { fileName, lineNumber, columnNumber } = stack
      const errorData = {
        type: EVENTTYPES.ERROR,
        status: STATUS_CODE.ERROR,
        time: getTimestamp(),
        message: ev.message,
        fileName,
        line: lineNumber,
        column: columnNumber,
      }
      userBehavior.push({
        type: EVENTTYPES.ERROR,
        category: userBehavior.getCategory(EVENTTYPES.ERROR),
        status: STATUS_CODE.ERROR,
        time: getTimestamp(),
        data: errorData,
      })
      const hash = getErrorUid(
        `${EVENTTYPES.ERROR}-${ev.message}-${fileName}-${columnNumber}`,
      )
      if (
        !options.repeatCodeError ||
        (options.repeatCodeError && !hashMapExist(hash))
      ) {
        return transportData.send(errorData)
      }
    }

    //资源加载报错
    if (target?.localName) {
      const data = resourceTransform(target)
      userBehavior.push({
        type: EVENTTYPES.RESOURCE,
        category: userBehavior.getCategory(EVENTTYPES.RESOURCE),
        status: STATUS_CODE.ERROR,
        time: getTimestamp(),
        data,
      })
      return transportData.send({
        ...data,
        type: EVENTTYPES.RESOURCE,
        status: STATUS_CODE.ERROR,
      })
    }
  },

  /**
   * @description 白屏处理
   */
  handleWhiteScreen(): void {
    openWhiteScreen((res: any) => {
      if (res.status === 'error') {
        transportData.send({
          type: EVENTTYPES.WHITESCREEN,
          time: getTimestamp(),
          ...res,
        })
      }
      // 上报白屏检测信息
    }, options)
  },
}

export { HandleEvents }
