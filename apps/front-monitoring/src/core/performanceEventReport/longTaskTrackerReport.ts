import { lazyReport } from '../../../utils'

export function longTaskTrackerReport() {
  try {
    new PerformanceObserver((list: PerformanceObserverEntryList) => {
      list.getEntries().forEach((entry: PerformanceEntry) => {
        if (entry.duration > 100) {
          lazyReport({
            kind: 'performance-related-Events',
            type: 'longTaskTrackerReport-longTask',
            params: {
              entry,
            },
          })
        }
      })
    }).observe({
      entryTypes: ['longtask'],
    })
    console.log('longTaskTrackerReport初始化完成')
  } catch (error) {
    console.log('longTaskTrackerReport初始化失败')
    lazyReport({
      kind: 'self-error',
      type: 'longTaskTrackerReport-initError',
      params: {
        error,
      },
    })
  }
}
