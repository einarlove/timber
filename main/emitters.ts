import { dialog } from "electron"
import fs from "fs"
import path from "path"
import startCase from "lodash.startcase"
import { ipcMain as ipc } from "electron"

import { store } from "./store"
import { getCollectionGitSuggestions } from "./services/git"
import { getEventSuggestions, getCalendars } from "./services/calendar/calendar"
import { GitConnection, TimeTrackingCollection, TimeTrackingEntry } from "../types/TimeTracking"

/**
 * Collections
 */

ipc.handle("get-collections", () => store.get("collections"))
ipc.handle("set-collections", (event, collections) => void store.set("collections", collections))

ipc.handle("add-collection", (event, collection: TimeTrackingCollection, index?: number) => {
  // console.log("add-collection", collection, { index })
  const collections = store.get("collections")
  store.set("collections", [
    ...collections.slice(0, index),
    collection,
    ...collections.slice(index || Infinity),
  ])
})

ipc.handle("set-collection", (event, collection: TimeTrackingCollection) => {
  // console.log("set-collection", collection)
  const collections = store.get("collections")
  store.set(
    "collections",
    collections.map(e => (e.id === collection.id ? collection : e))
  )
})

ipc.handle("remove-collection", (event, collection: TimeTrackingCollection) => {
  // console.log("remove-collection", collection)
  const collections = store.get("collections")
  store.set(
    "collections",
    collections.filter(e => e.id !== collection.id)
  )
})

/**
 * Entries
 */

ipc.handle("get-entries", (event, { from, to }: { from: Date; to: Date }) => {
  return store.get("entries").filter(entry => {
    return (
      !entry.completedAt ||
      (entry.completedAt > from.toISOString() && entry.completedAt < to.toISOString())
    )
  })
})

ipc.handle("add-entry", (event, entry: TimeTrackingEntry, before?: TimeTrackingEntry) => {
  // console.log("add-entry", entry, { before })
  const entries = store.get("entries")
  const index = before ? entries.findIndex(entry => entry.id === before.id) : undefined
  store.set("entries", [...entries.slice(0, index), entry, ...entries.slice(index || Infinity)])
})

ipc.handle("set-entry", (event, entry: TimeTrackingEntry) => {
  // console.log("set-entry", entry)
  const entries = store.get("entries")
  store.set(
    "entries",
    entries.map(e => (e.id === entry.id ? entry : e))
  )
})

ipc.handle("remove-entry", (event, entry: TimeTrackingEntry) => {
  // console.log("remove-entry", entry)
  const entries = store.get("entries")
  store.set(
    "entries",
    entries.filter(e => e.id !== entry.id)
  )
})

/**
 * Suggestions
 */

ipc.handle(
  "get-suggestions",
  async (
    event,
    {
      fromDate,
      toDate,
      collectionIds = [],
    }: { fromDate: Date; toDate: Date; collectionIds?: string[] }
  ) => {
    let promises: Promise<TimeTrackingEntry[] | undefined>[] = []

    promises.push(
      ...store
        .get("collections")
        .filter(collection => collectionIds.includes(collection.id))
        .map(collection => {
          return getCollectionGitSuggestions(collection, fromDate, toDate)
        })
    )

    const calendars = store.get("settings").calendars
    if (calendars?.length) promises.push(getEventSuggestions(calendars, fromDate, toDate))

    const suggestions = await Promise.all(promises)
    return suggestions.filter(s => s).flat()
  }
)

/**
 * Other
 */

ipc.handle("get-settings", () => store.get("settings"))
ipc.handle("set-settings", (event, settings) => store.set("settings", settings))

ipc.handle("get-calendars", () => getCalendars())

ipc.handle("reset", () => store.clear())

ipc.handle(
  "add-git",
  async (event, collectionId: string, window): Promise<GitConnection | undefined> => {
    const response = await dialog.showOpenDialog(window, { properties: ["openDirectory"] })
    if (!response.canceled) {
      const directory = response.filePaths[0]
      let name = path.basename(directory)

      // Check if there's a package.json in that directory and get the name
      const packageJsonPath = path.join(directory, "package.json")
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readFileSync(packageJsonPath, "utf8")
        name = JSON.parse(packageJson).name
      }

      return { directory, name: startCase(name) }
    }
  }
)
