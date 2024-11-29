import type { baseObj } from '../base'

export interface VueInstance {
  [key: string]: any
  // config: VueConfiguration;
  // version?: string;
}

export interface ViewModel {
  [key: string]: any
  $root?: Record<string, unknown>
  $options?: {
    [key: string]: any
    name?: string
    propsData?: baseObj
    _componentTag?: string
    __file?: string
    props?: baseObj
  }
  $props?: Record<string, unknown>
}
