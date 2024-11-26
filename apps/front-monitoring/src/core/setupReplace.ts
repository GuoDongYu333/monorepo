import { EVENTTYPES, STATUS_CODE } from '../../common'
import { HandleEvents } from './handleEvents'
import { addReplaceHandler } from './replace'
import { htmlElementAsString, getTimestamp } from '../../utils'
import { userBehavior } from './userBehavior'
export function setupReplace() {
  //白屏监测
  addReplaceHandler({
    callback: () => {
      HandleEvents.handleWhiteScreen()
    },
    type: EVENTTYPES.WHITESCREEN,
  })
  //重写XHR
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, EVENTTYPES.XHR)
    },
    type: EVENTTYPES.XHR,
  })
  //重写fetch
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, EVENTTYPES.FETCH)
    },
    type: EVENTTYPES.FETCH,
  })
  //捕获错误
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleError(data)
    },
    type: EVENTTYPES.ERROR,
  })
  //监听history模式下路由变化
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHistory(data)
    },
    type: EVENTTYPES.HISTORY,
  })
  //监听hash路由变化
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHashChange(data)
    },
    type: EVENTTYPES.HASHCHANGE,
  })
  //监听promise异常
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleUnhandleRejection(data)
    },
    type: EVENTTYPES.UNHANDLEDREJECTION,
  })
  //监听click事件
  addReplaceHandler({
    callback: (data) => {
      const htmlString = htmlElementAsString(
        data.data.activeElement as HTMLElement,
      )
      if (htmlString) {
        userBehavior.push({
          type: EVENTTYPES.CLICK,
          status: STATUS_CODE.SUCCESS,
          category: userBehavior.getCategory(EVENTTYPES.CLICK),
          data: htmlString,
          time: getTimestamp(),
        })
      }
    },
    type: EVENTTYPES.CLICK,
  })
}
