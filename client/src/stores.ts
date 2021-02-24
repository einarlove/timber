import create from "zustand"
import produce from "immer"
import { TimeTrackingCollection } from "../../types/TimeTracking"
import { useCallback } from "react"

type TodoStoreState = {
  collections: Record<string, TimeTrackingCollection>
}

type TodoStore = TodoStoreState & {
  set: (fn: (state: TodoStoreState) => void) => void
}

export const useTodoStore = create<TodoStore>((set) => ({
  collections: {
    "initial-collection": { key: "initial-collection", displayName: "My todos", entries: [] },
  },
  set: (fn) => set((state) => produce(state, fn)),
}))

export const useCollection = (key: string) =>
  useTodoStore(
    useCallback(
      (state) => ({
        collection: state.collections[key],
        setCollection: (set: (state: TimeTrackingCollection) => void) =>
          state.set((state) => set(state.collections[key])),
      }),
      [key]
    )
  )
