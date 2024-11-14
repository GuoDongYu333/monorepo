import { lazyReport } from '../utils/report'
import { waitLoading } from '../utils/utils'

/**
 *
 * @param {Array<RegExp>} curBlankScreen 如果只有几个元素则判断为白屏
 */
export function blankScreenTrackerReport(curBlankScreen: Array<RegExp> = []) {
  try {
    const defaultBlankScreen = ['html', 'body', '#container', '.content']
    let emptyElements = 0
    const warpperElements =
      curBlankScreen.length === 0
        ? defaultBlankScreen.map((s) => new RegExp(s))
        : curBlankScreen

    function getSelector(element: Element) {
      const { id, className, nodeName } = element
      if (id) {
        return `#${id}`
      } else if (className) {
        return `.${className
          .split(' ')
          .filter((item) => !!item)
          .join('.')}`
      } else {
        return nodeName.toLowerCase()
      }
    }

    function isWarpper(element: Element) {
      try {
        const selector = getSelector(element)
        console.log(selector, '这是selector')
        if (warpperElements.some((regex) => regex.test(selector))) {
          emptyElements++
        }
      } catch (error) {
        console.log('判断是否为空白元素错误')
        lazyReport({
          kind: 'self-error',
          type: 'blankScreenTrackerReport-isWarpperError',
          params: {
            error,
          },
        })
      }
    }

    function trackElements() {
      try {
        let x: Element | null, y: Element | null
        const trackerPointsNum = 16
        for (let i = 0; i < trackerPointsNum; i++) {
          y = document.elementFromPoint(
            (window.innerHeight * i) / trackerPointsNum,
            window.innerWidth / 2,
          )
          x = document.elementFromPoint(
            window.innerHeight / 2,
            (window.innerWidth * i) / trackerPointsNum,
          )
          if (x) isWarpper(x)
          if (y) isWarpper(y)
        }

        if (emptyElements > 0) {
          const centerElements = document.elementsFromPoint(
            window.innerWidth / 2,
            window.innerHeight / 2,
          )
          if (centerElements.length > 0) {
            lazyReport({
              kind: 'performance-related-Events',
              type: 'blankScreenTrackerReport-blackScreen',
              params: {
                screen: `${window.screen.width}X${window.screen.height}`,
                viewPoint: `${window.innerWidth}X${window.innerHeight}`,
                selector: getSelector(centerElements[0]),
              },
            })
          }
        }
      } catch (error) {
        console.error('Error in trackElements:', error)
      }
    }

    waitLoading(trackElements)
    console.log('白屏上报初始化完成')
  } catch (error) {
    console.log('白屏上报初始化失败')
    lazyReport({
      kind: 'self-error',
      type: 'blankScreenTrackerReport-initError',
      params: {
        error,
      },
    })
  }
}
