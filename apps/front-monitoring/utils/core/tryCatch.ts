/**
 * @description 一个try--catch---
 * @param fn 执行的函数
 * @param errorFn 错误执行的函数
 */
export function tryCatch(
  fn: (...args: any[]) => any,
  errorFn?: (...args: any) => any,
): void {
  try {
    fn()
  } catch (e) {
    if (errorFn) {
      errorFn(e)
    }
  }
}
