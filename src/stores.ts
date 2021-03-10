import create from "zustand"
import produce from "immer"
import { TimeTrackingCollection } from "../types/TimeTracking"
import { useCallback } from "react"

type CollectionsStoreState = {
  collections: TimeTrackingCollection[]
}

type CollectionsStore = CollectionsStoreState & {
  set: (fn: (state: CollectionsStore) => void) => void
}

export const useCollectionsStore = create<CollectionsStore>(set => ({
  collections: [],
  set: fn => set(state => produce(state, fn)),
}))

export const useCollection = (id: string) =>
  useCollectionsStore(
    useCallback(
      state => ({
        collection: state.collections.find(collection => collection.id === id),
        setCollection: (set: (state: TimeTrackingCollection) => void) =>
          state.set(state => set(state.collections.find(collection => collection.id === id)!)),
      }),
      [id]
    )
  )

const { ipcRenderer: ipc } = window.require("electron")

async function RefreshClientState() {
  const collections = await ipc.invoke("get-collections")
  useCollectionsStore.setState({ collections })
}

useCollectionsStore.subscribe(store => {
  ipc.send("set-collections", store.collections)
})

ipc.on("set-collections", (event, collections) => {
  useCollectionsStore.setState({ collections })
})

ipc.on("window-focus", () => {
  RefreshClientState()
})
