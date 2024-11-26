import { STATUS_CODE } from '../../common'
import type { Callback, InitOptions } from '../../types'
import { _global, _support } from '../../utils'

/**
 * @description 检测页面是否白屏
 * @param {function} callback - 回调函数获取检测结果
 * @param {boolean} skeletonProject - 页面是否有骨架屏
 * @param {array} whiteBoxElements - 容器列表，默认值为['html', 'body', '#app', '#root']
 */
export function openWhiteScreen(
  callback: Callback,
  { skeletonProject, whiteBoxElements }: InitOptions,
) {
  let whiteLoop = 0
  const _firstInitList: string[] = []
  let _nowSelectList: string[] = []

  // 处理页面加载完成状态与空闲回调的关联逻辑
  if (skeletonProject) {
    if (document.readyState !== 'complete') {
      idleCallback()
    }
  } else {
    if (document.readyState === 'complete') {
      idleCallback()
    } else {
      window.addEventListener('load', () => {
        idleCallback()
      })
    }
  }

  // 开启循环检测的函数，设置定时循环并在每次循环时执行空闲回调相关逻辑
  function openWhiteLoop(): void {
    if (_support.loopTimer) {
      return
    }
    _support.loopTimer = setInterval(() => {
      if (skeletonProject) {
        whiteLoop++
        _nowSelectList = []
      }
      idleCallback()
    }, 10000)
  }

  // 空闲回调函数，优先使用requestIdleCallback来利用浏览器空闲时间执行采样逻辑，若不支持则直接执行采样逻辑
  function idleCallback(): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback((deadline) => {
        if (deadline.timeRemaining() > 0) {
          sampling()
        }
      })
    } else {
      sampling()
    }
  }
  // 根据给定元素获取对应的CSS选择器
  function getSelector(element: HTMLElement): string {
    if (element.id) {
      return '#' + element.id
    } else if (element.className) {
      // 将类名中的空格分割后用点号连接，例如：div home => div.home
      return (
        '.' +
        element.className
          .split(' ')
          .filter((item) => !!item)
          .join('.')
      )
    } else {
      return element.nodeName.toLowerCase()
    }
  }

  // 判断元素是否为目标容器元素，并根据情况添加选择器到对应列表
  function isContainer(element: HTMLElement): boolean {
    const selector = getSelector(element)
    if (skeletonProject) {
      if (whiteLoop) {
        _nowSelectList.push(selector)
      } else {
        _firstInitList.push(selector)
      }
    }
    return whiteBoxElements?.indexOf(selector) !== -1
  }

  // 采样函数，用于检测页面特定位置元素情况并根据规则执行相应逻辑
  function sampling(): void {
    let emptyPoints = 0
    // 循环检测页面上垂直方向多个位置的元素情况
    for (let i = 1; i <= 9; i++) {
      const xElements = document.elementsFromPoint(
        window.innerWidth / 2,
        (i * window.innerHeight) / 10,
      )

      const yElements = document.elementsFromPoint(
        window.innerWidth / 2,
        (window.innerHeight * i) / 10,
      )

      if (isContainer(xElements[0] as HTMLElement)) {
        emptyPoints++
      }
      if (i !== 5) {
        if (isContainer(yElements[0] as HTMLElement)) {
          emptyPoints++
        }
      }
    }

    if (emptyPoints !== 17) {
      if (skeletonProject) {
        // 如果有骨架屏，且是第一次循环则不比较，直接进入下一次循环
        if (!whiteLoop) {
          return openWhiteLoop()
        }
        // 比较当前选择器列表和首次初始化选择器列表是否一致，一致则表示出错
        if (_nowSelectList.join() === _firstInitList.join()) {
          return callback({
            status: STATUS_CODE.ERROR,
          })
        }
      }
      if (typeof _support.loopTimer === 'number') {
        clearTimeout(_support.loopTimer)
        _support.loopTimer = null
      }
    } else {
      if (!_support.loopTimer) {
        openWhiteLoop()
      }
    }
    callback({
      status: emptyPoints === 17 ? STATUS_CODE.ERROR : STATUS_CODE.SUCCESS,
    })
  }
}
