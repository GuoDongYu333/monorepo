import type { HttpData, ResourceTarget } from '../../types'
import { HTTP_CODE, STATUS_CODE } from '../../common'
import { options } from './options'
import { fromHttpStatus, getTimestamp, interceptStr } from '../../utils'
export function httpTransform(data: HttpData): HttpData {
  let msg: any = ''
  const {
    elapsedTime,
    time,
    method = '',
    type,
    Status = 200,
    response,
    requestData,
  } = data
  let status: STATUS_CODE
  if (Status === 0) {
    status = STATUS_CODE.ERROR
    msg =
      elapsedTime <= options.overTime * 1000
        ? `请求失败，Status值为:${Status}`
        : '请求失败，接口超时'
  } else if (Status < HTTP_CODE.BAD_REQUEST) {
    status = STATUS_CODE.SUCCESS
    if (
      options.handleHttpStatus &&
      typeof options.handleHttpStatus == 'function'
    ) {
      if (options.handleHttpStatus(data)) {
        status = STATUS_CODE.SUCCESS
      } else {
        status = STATUS_CODE.ERROR
        msg = `接口报错，报错信息为：${
          typeof response == 'object' ? JSON.stringify(response) : response
        }`
      }
    }
  } else {
    status = STATUS_CODE.ERROR
    msg = `请求失败，Status值为:${Status}，${fromHttpStatus(Status as number)}`
  }
  msg = `${data.url}; ${msg}`
  return {
    url: data.url,
    time,
    status,
    elapsedTime,
    message: msg,
    requestData: {
      httpType: type as string,
      method,
      data: requestData || '',
    },
    response: {
      Status,
      data: status == STATUS_CODE.ERROR ? response : null,
    },
  }
}

export function resourceTransform(target: ResourceTarget) {
  return {
    time: getTimestamp(),
    message:
      (interceptStr(target.src as string, 120) ||
        interceptStr(target.href as string, 120)) + '; 资源加载失败',
    name: target.localName as string,
  }
}
