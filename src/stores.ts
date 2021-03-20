import React from "react"
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns"
import { TimeTrackingCollection, TimeTrackingEntry } from "../types/TimeTracking"
import { isSameDay } from "./utils"

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

export function useSuggestionsByDay(date: Date, collections?: TimeTrackingCollection[]) {
  const [suggestions, setSuggestions] = React.useState<TimeTrackingEntry[]>()

  const refetchSuggestions = React.useCallback(() => {
    if (collections)
      ipc
        .invoke("get-suggestions", {
          fromDate: startOfWeek(date),
          toDate: endOfWeek(date),
          collectionIds: collections?.map(collection => collection.id),
        })
        .then((suggestions: TimeTrackingEntry[]) => {
          setSuggestions(suggestions)
        })
  }, [date, collections])

  React.useEffect(refetchSuggestions, [refetchSuggestions])

  React.useEffect(() => {
    ipc.on("window-focus", refetchSuggestions)
    return () => void ipc.removeListener("window-focus", refetchSuggestions)
  }, [refetchSuggestions])

  return {
    suggestions: suggestions?.filter(s => {
      if (s.completedAt) return isSameDay(date, new Date(s.completedAt))
      if (s.source === "calendar-event") return isSameDay(date, new Date(s.startDate))
      return false
    }),
    refetchSuggestions,
  }
}
