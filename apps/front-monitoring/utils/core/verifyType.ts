function isType(type: any) {
  return function (value: any): boolean {
    return Object.prototype.toString.call(value) === `[object ${type}]`
  }
}

/**
 * @description 类型判断
 */
export const variableTypeDetection = {
  isNumber: isType('Number'),
  isString: isType('String'),
  isBoolean: isType('Boolean'),
  isNull: isType('Null'),
  isNullOrUndefined: (value: any) => value === null || value === undefined,
  isObject: (value: any) => value !== null && typeof value === 'object',
  isArray: isType('Array'),
  isFunction: isType('Function'),
  isSymbol: isType('Symbol'),
  isUndefined: isType('Undefined'),
  isWindow: isType('Window'),
}

/**
 * @description 判断是否是规定类型的错误
 */
export function isError(error: Error): boolean {
  switch (Object.defineProperty.toString.call(error)) {
    case '[object Error]':
      return true
    case '[object DOMException]':
      return true
    case '[object Exception]':
      return true
    default:
      return false
  }
}

/**
 * @description 判断是否为空对象
 */

export function isEmptyObject(obj: any): boolean {
  return variableTypeDetection.isObject(obj) && Object.keys(obj).length === 0
}

/**
 * @description 判断是否为空
 */
export function isEmpty(obj: any): boolean {
  return (
    (variableTypeDetection.isString(obj) && obj.trim() === '') ||
    obj === null ||
    obj === undefined
  )
}

/**
 * @description 判断对象是否包含某个属性
 */
export function isExistProperty(obj: any, key: any): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}
