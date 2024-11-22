import { EVENTTYPES } from '../../../common'
import { ReplaceCallback, ReplaceHandler } from '../../../types'
import { getFlag, tryCatch } from '../../../utils'

const handlers: { [key in EVENTTYPES]?: ReplaceCallback[] } = {}

export function subscribeEvent(handler: ReplaceHandler): boolean {
  if (!handler || getFlag(handler.type)) return false
  handlers[handler.type] = handlers[handler.type] || []
  handlers[handler.type]?.push(handler.callback)
  return true
}

export function notify(type: EVENTTYPES, data?: any): void {
  handlers[type]?.forEach((handle) => {
    tryCatch(
      () => handle(data),
      () => {},
    )
  })
}
