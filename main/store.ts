import ElectronStore from "electron-store"
import { Settings } from "../types/settings"
import { TimeTrackingCollection, TimeTrackingEntry } from "../types/TimeTracking"

type Store = {
  collections: TimeTrackingCollection[]
  entries: TimeTrackingEntry[]
  settings: Settings
  mainWindowBounds?: Electron.Rectangle
}

const defaults: Store = {
  collections: [
    { id: "initial-collection", displayName: "My todos" },
    { id: "krogsveen", displayName: "Krogsveen" },
  ],
  entries: [],
  settings: {},
}

export const store = new ElectronStore({
  defaults,
})
