import { isObject } from 'lodash-es'

function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] =
      isObject(src[key]) && src[key] !== null
        ? deepMerge(src[key], target[key])
        : (src[key] = target[key])
  }
  return src
}

export { deepMerge }
