import ErrorStackParser from 'error-stack-parser'
import { EVENTTYPES, STATUS_CODE } from '../../common'
import { getTimestamp, isError } from '../../utils'
import { userBehavior } from './userBehavior'
import { transportData } from './reportData'

/**
 * @description 自定义上报
 * @param message 错误信息
 * @param error 错误对象
 * @param type 错误类型
 */
export function CustomTracker({
  message = 'customTrackerMsg',
  error = new Error(),
  type = EVENTTYPES.CUSTOM,
}) {
  try {
    let errorInfo = {}
    if (isError(error)) {
      const res = ErrorStackParser.parse(
        //@ts-ignore
        !error.target ? error : error.error || error.reason,
      )[0]
      errorInfo = {
        ...res,
        line: res.lineNumber,
        column: res.columnNumber,
      }
      userBehavior.push({
        type,
        status: STATUS_CODE.ERROR,
        category: userBehavior.getCategory(EVENTTYPES.CUSTOM),
        data: message,
        time: getTimestamp(),
      })
      transportData.send({
        type,
        status: STATUS_CODE.ERROR,
        message: message,
        time: getTimestamp(),
        ...errorInfo,
      })
    }
  } catch (error) {
    console.log(error)
  }
}
