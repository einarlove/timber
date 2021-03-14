import React from "react"
import { startOfDay, endOfDay } from "date-fns"
import { TimeTrackingCollection, TimeTrackingEntry } from "../types/TimeTracking"

const { ipcRenderer: ipc } = window.require("electron")

export function useCollections() {
  const [collections, setCollections] = React.useState<TimeTrackingCollection[]>()

  const refetchCollection = React.useCallback(() => {
    console.log("refetchCollection")
    ipc.invoke("get-collections").then(setCollections)
  }, [])

  React.useEffect(refetchCollection, [refetchCollection])

  React.useEffect(() => {
    ipc.on("window-focus", refetchCollection)
    return () => void ipc.removeListener("window-focus", refetchCollection)
  }, [refetchCollection])

  const set = React.useCallback(collections => {
    ipc.send("set-collections", collections)
    setCollections(collections)
  }, [])

  const setCollection = React.useCallback(
    (collection: TimeTrackingCollection) =>
      void ipc.invoke("set-collection", collection).then(refetchCollection).catch(console.log),
    [refetchCollection]
  )

  const removeCollection = React.useCallback(
    (collection: TimeTrackingCollection) =>
      void ipc.invoke("remove-collection", collection).then(refetchCollection),
    [refetchCollection]
  )

  const addCollection = React.useCallback(
    async (collection: TimeTrackingEntry, index?: number) =>
      void ipc.invoke("add-collection", collection, index).then(refetchCollection),
    [refetchCollection]
  )

  return { collections, setCollections: set, setCollection, removeCollection, addCollection }
}

const entriesByDay: { [date: string]: TimeTrackingEntry[] } = {}

export function useEntriesByDay(date: Date) {
  const day = date.toISOString().slice(0, 10)
  const [entries, setEntries] = React.useState<TimeTrackingEntry[] | undefined>(entriesByDay[day])

  const refetchEntries = React.useCallback(() => {
    console.log("refetchEntries")
    ipc
      .invoke("get-entries", { from: startOfDay(date), to: endOfDay(date) })
      .then((entries: TimeTrackingEntry[]) => {
        setEntries(entries)
      })
  }, [date])

  React.useEffect(refetchEntries, [refetchEntries])

  React.useEffect(() => {
    ipc.on("window-focus", refetchEntries)
    return () => void ipc.removeListener("window-focus", refetchEntries)
  }, [refetchEntries])

  const setEntry = React.useCallback(
    (entry: TimeTrackingEntry) => void ipc.invoke("set-entry", entry).then(refetchEntries),
    [refetchEntries]
  )

  const removeEntry = React.useCallback(
    (entry: TimeTrackingEntry) => void ipc.invoke("remove-entry", entry).then(refetchEntries),
    [refetchEntries]
  )

  const addEntry = React.useCallback(
    async (entry: TimeTrackingEntry, before?: TimeTrackingEntry) =>
      void ipc.invoke("add-entry", entry, before).then(refetchEntries),
    [refetchEntries]
  )

  return { entries, addEntry, setEntry, removeEntry, refetchEntries }
}
