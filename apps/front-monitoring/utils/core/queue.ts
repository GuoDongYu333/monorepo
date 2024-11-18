import { _global } from './global'
/**
 * @description 延迟执行队列
 */
export class Queue {
  private stack: any[] = []
  private isFlushing = false
  constructor() {}

  /**
   * @description 添加函数到队列，如果当前函数不支持requestIdleCallback或Promise则直接执行，否则使用异步执行
   * @param fn 加入队列的函数
   * @returns {void}
   */
  addFn(fn: VoidFunction): void {
    if (typeof fn !== 'function') {
      return
    }
    if (!('requestIdleCallback' in _global || 'Promise' in _global)) {
      fn()
      return
    }
    this.stack.push(fn)
    if (!this.isFlushing) {
      this.isFlushing = true
      if ('requestIdleCallback' in _global) {
        requestIdleCallback(() => this.flushStack())
      } else {
        Promise.resolve().then(() => this.flushStack())
      }
    }
  }

  /**
   * @description 清空队列
   * @returns {void}
   */
  clear(): void {
    this.stack = []
  }

  /**
   * @description 获取队列
   * @returns {any[]} stack队列
   */
  getStack(): any[] {
    return this.stack
  }

  /**
   * @description 执行队列，先备份后执行防止新来的任务扰乱执行
   * @returns {void}
   */
  flushStack(): void {
    const temp = this.stack.slice(0)
    this.stack = []
    this.isFlushing = false
    for (let i = 0; i < temp.length; i++) {
      temp[i]()
    }
  }
}
