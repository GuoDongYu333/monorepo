import { record } from 'rrweb'
import { _support, generateUUID, getTimestamp } from '../../../utils'
import { EVENTTYPES, STATUS_CODE } from '../../../common'
import pako from 'pako'
import { Base64 } from 'js-base64'

export function handleScreen(
  transportData: any,
  recordScreenTime: number,
): void {
  let events: any[] = []
  record({
    emit(event, isCheckout) {
      if (isCheckout) {
        if (_support.hasError) {
          const recordScreenId = _support.recordScreenId
          _support.recordScreenId = generateUUID()
          transportData({
            type: EVENTTYPES.RECORDSCREEN,
            recordScreenId,
            time: getTimestamp(),
            status: STATUS_CODE.SUCCESS,
            events: zip(event),
          })
          events = []
          _support.hasError = false
        } else {
          events = []
          _support.recordScreenId = generateUUID()
        }
      }
      events.push(event)
    },
    recordCanvas: true,
    checkoutEveryNms: 1000 * recordScreenTime,
  })
}

export function zip(data: any) {
  if (!data) return data
  // 判断数据是否需要转为JSON
  const dataJson =
    typeof data !== 'string' && typeof data !== 'number'
      ? JSON.stringify(data)
      : data
  // 使用Base64.encode处理字符编码，兼容中文
  const str = Base64.encode(dataJson as string)
  const binaryString = pako.gzip(str)
  const arr = Array.from(binaryString)
  let s = ''
  arr.forEach((item: any) => {
    s += String.fromCharCode(item)
  })
  return Base64.btoa(s)
}
