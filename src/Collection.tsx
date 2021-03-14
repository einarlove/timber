import { AnimatePresence, motion } from "framer-motion"
import React from "react"
import { BiGitBranch } from "react-icons/bi"
import { GitConnection, TimeTrackingCollection, TimeTrackingEntry } from "../types/TimeTracking"
import { useEntriesByDay } from "./stores"
import { TimeTrackEntry } from "./TimeTrackEntry"
import { isSameDay } from "./utils"

type CollectionProps = {
  viewDate: Date
  collection: TimeTrackingCollection
  set: (collection: TimeTrackingCollection) => void
}

const { ipcRenderer: ipc } = window.require("electron")

const getNewEntry = (collectionId: string, initial?: Partial<TimeTrackingEntry>) => ({
  id: new Date().toISOString(),
  collectionId,
  description: "",
  ...initial,
})

export function Collection({ collection, set, viewDate }: CollectionProps) {
  const autoFocusId = React.useRef<string>()
  const entryInputsRef = React.useRef<Record<string, HTMLTextAreaElement>>({})
  const newEntryRef = React.useRef<TimeTrackingEntry>(getNewEntry(collection.id))
  const newEntryNodeRef = React.useRef<HTMLTextAreaElement>(null)
  const { entries, addEntry, setEntry, removeEntry } = useEntriesByDay(viewDate)

  if (!collection) return null
  const suggestions = collection.suggestions
    ?.filter(suggestion => !entries?.some(entry => entry.id === suggestion.id))
    .filter(
      suggestion => !suggestion.completedAt || isSameDay(new Date(suggestion.completedAt), viewDate)
    )

  console.log(entries)

  return (
    <div className="collection">
      <div className="collection-header">
        <div className="collection-title">{collection.displayName}</div>
        <div className="collection-menu-wrapper">
          <button className="collection-menu-toggle">•••</button>
          <div className="collection-menu-dropdown">
            <button
              onClick={() => {
                ipc.invoke("add-git").then((connection: GitConnection) => {
                  console.log("added git", connection)
                  set({
                    ...collection,
                    repositories: [...(collection.repositories || []), connection],
                  })
                })
              }}
            >
              Connect Git Repository
            </button>
          </div>
        </div>
      </div>
      <div className="collection-entry-list">
        <AnimatePresence>
          {entries
            ?.filter(entry => entry.collectionId === collection.id)
            .filter(entry => {
              const completedDate = entry.completedAt || entry.partialCompletedAt
              return completedDate ? isSameDay(new Date(completedDate), viewDate) : true
            })
            .map((entry, index, entries) => {
              return (
                <motion.div
                  key={entry.id}
                  className="collection-entry-list-item"
                  layout
                  transition={{ type: "spring", duration: 0.2, bounce: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <TimeTrackEntry
                    entry={entry}
                    viewDate={viewDate}
                    autoFocus={autoFocusId.current === entry.id}
                    inputRef={ref => {
                      ref
                        ? (entryInputsRef.current[entry.id] = ref)
                        : delete entryInputsRef.current[entry.id]
                    }}
                    // set={update => setCollection(state => update(state.entries[index]))}
                    set={setEntry}
                    discard={() => removeEntry(entry)}
                    focus={direction => {
                      const previousEntry = entries[index - 1]
                      const nextEntry = entries[index + 1]
                      const focusEntry = direction === "backward" ? previousEntry : nextEntry
                      const focusInput =
                        entryInputsRef.current[focusEntry?.id] || newEntryNodeRef.current
                      focusInput?.focus()
                    }}
                    createNewAfter={() => {
                      const nextEntry = entries[index + 1]
                      if (!nextEntry) {
                        newEntryNodeRef.current?.focus()
                      } else {
                        const id = new Date().toISOString()
                        autoFocusId.current = id
                        addEntry(getNewEntry(collection.id, { id }), nextEntry)
                      }
                    }}
                  />
                </motion.div>
              )
            })}
          <motion.div
            key={newEntryRef.current.id}
            className="collection-entry-list-item"
            layout
            transition={{ type: "spring", duration: 0.2, bounce: 0 }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <TimeTrackEntry
              entry={newEntryRef.current}
              inputRef={newEntryNodeRef}
              viewDate={viewDate}
              set={entry => {
                if (entry.description) {
                  addEntry(getNewEntry(collection.id, entry))
                  newEntryRef.current = getNewEntry(collection.id)
                }
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {Boolean(suggestions?.length) && (
          <motion.div
            className="suggestions"
            transition={{ type: "spring", duration: 0.2, bounce: 0 }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "auto" }}
          >
            <div className="suggestions-title">Related</div>
            {suggestions?.map(suggestion => (
              <div
                className="suggestion"
                key={suggestion.id}
                onClick={() => {
                  addEntry(getNewEntry(collection.id, suggestion))
                }}
              >
                {suggestion.description}{" "}
                {suggestion.source === "git-commit" && (
                  <span className="suggestion-branch">
                    <BiGitBranch /> {suggestion.branch}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
