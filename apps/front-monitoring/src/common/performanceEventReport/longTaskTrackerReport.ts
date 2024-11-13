// import { lazyReport } from './report'

export function longTaskTrackerReport() {
  new PerformanceObserver((list: PerformanceObserverEntryList) => {
    list.getEntries().forEach((entry: PerformanceEntry) => {
      if (entry.duration > 100) {
        console.log(entry, list, '这是想看的')
      }
    })
  }).observe({
    entryTypes: ['longtask'],
  })
}
