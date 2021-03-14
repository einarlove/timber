import ElectronStore from "electron-store"
import { produce } from "immer"
import { WritableDraft } from "immer/dist/internal"

import { TimeTrackingCollection, TimeTrackingEntry } from "../types/TimeTracking"

type Store = {
  collections: TimeTrackingCollection[]
  entries: TimeTrackingEntry[]
  mainWindowBounds?: Electron.Rectangle
}

const defaults: Store = {
  collections: [
    { id: "initial-collection", displayName: "My todos" },
    { id: "krogsveen", displayName: "Krogsveen" },
  ],
  entries: [],
}

export const store = new ElectronStore({
  defaults,
})

export const setCollection = (
  id: string,
  recipe: (collection: WritableDraft<TimeTrackingCollection>) => void
) => {
  store.set(
    "collections",
    produce(store.get("collections"), collections => {
      const collection = collections.find(c => c.id === id)
      if (collection) recipe(collection)
    })
  )
}
