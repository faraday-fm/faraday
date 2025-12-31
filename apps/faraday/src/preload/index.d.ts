import { ElectronAPI } from '@electron-toolkit/preload'
import type { FspRequest, FspResponse } from '../main/fsp/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fsp: {
        sendRequest: (request: FspRequest) => void
        onResponse: (callback: (response: FspResponse) => void) => () => void
      }
    }
  }
}
