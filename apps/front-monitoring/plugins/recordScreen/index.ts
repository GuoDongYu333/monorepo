import { EVENTTYPES } from '../../common'
import { BasePlugin, RecordScreenOption, SdkBase } from '../../types'
import { validateOptions, generateUUID, _support } from '../../utils'
import { handleScreen } from './core/recordScreen'

export default class RecordScreen extends BasePlugin {
  type: string
  recordScreenTime = 10
  recordScreenTypeList: string[] = [
    EVENTTYPES.ERROR,
    EVENTTYPES.UNHANDLEDREJECTION,
    EVENTTYPES.RESOURCE,
    EVENTTYPES.FETCH,
    EVENTTYPES.XHR,
  ]

  constructor(params = {} as RecordScreenOption) {
    super(EVENTTYPES.RECORDSCREEN)
    this.type = EVENTTYPES.RECORDSCREEN
    this.bindOptions(params)
  }

  bindOptions(params: RecordScreenOption): void {
    const { recordScreenTypeList, recordScreenTime } = params
    if (validateOptions(recordScreenTime, 'recordScreenTime', 'number')) {
      this.recordScreenTime = recordScreenTime
    }
    if (
      validateOptions(recordScreenTypeList, 'recordScreenTypeList', 'array')
    ) {
      this.recordScreenTypeList = recordScreenTypeList
    }
  }

  core({ transportData, options }: SdkBase): void {
    options.silentRecordScreen = true
    options.recordScreenTypeList = this.recordScreenTypeList
    // 添加初始的recordScreenId
    _support.recordScreenId = generateUUID()
    handleScreen(transportData, this.recordScreenTime)
  }
  transform() {}
}
