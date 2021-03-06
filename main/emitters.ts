import { dialog } from "electron"
import fs from "fs"
import path from "path"
import startCase from "lodash.startcase"
import { ipcMain as ipc } from "electron"

import { setCollection, store } from "./store"
import { getCollectionGitSuggestions } from "./functions"
import { TimeTrackingCollection } from "../types/TimeTracking"

function getCollectionsWithSuggestions() {
  return Promise.all(
    store.get("collections").map(
      async (collection): Promise<TimeTrackingCollection> => {
        const suggestions = await getCollectionGitSuggestions(collection)
        return { ...collection, suggestions }
      }
    )
  )
}

ipc.handle("get-collections", () => getCollectionsWithSuggestions())
ipc.on("set-collections", (event, collections) => void store.set("collections", collections))

ipc.handle("add-git", async (event, collectionId: string, window) => {
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

    setCollection(collectionId, collection => {
      if (!collection.repositories?.some(r => r.directory === directory)) {
        collection.repositories = [
          ...(collection.repositories || []),
          { directory, name: startCase(name) },
        ]
      }
    })
  }

  return getCollectionsWithSuggestions()
})

ipc.handle("reset-collections", event => {
  store.clear()
  return store.get("collections")
})
