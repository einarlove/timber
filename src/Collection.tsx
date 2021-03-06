import produce from "immer"
import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCollection, useCollectionsStore } from "./stores"
import { TimeTrackEntry } from "./TimeTrackEntry"
import { TimeTrackingEntry } from "../types/TimeTracking"
import { datesAreOnSameDay } from "./utils"

type CollectionProps = {
  id: string
  viewDate: Date
}

const { ipcRenderer: ipc } = window.require("electron")

const getNewEntry = (initial?: Partial<TimeTrackingEntry>) => ({
  id: new Date().toISOString(),
  description: "",
  date: new Date().toISOString(),
  ...initial,
})

export function Collection({ id, viewDate }: CollectionProps) {
  const autoFocusId = React.useRef<string>()
  const entryInputsRef = React.useRef<Record<string, HTMLTextAreaElement>>({})
  const newEntryRef = React.useRef<HTMLTextAreaElement>(null)
  const { collection, setCollection } = useCollection(id)

  if (!collection) return null

  return (
    <div className="collection">
      <div className="collection-header">
        <div className="collection-title">{collection.displayName}</div>
        <div className="collection-menu-wrapper">
          <button className="collection-menu-toggle">•••</button>
          <div className="collection-menu-dropdown">
            <button
              onClick={() => {
                ipc.invoke("add-git", collection.id).then((collections: any) => {
                  useCollectionsStore.setState({ collections })
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
          {collection.entries
            ?.filter(entry => {
              const completedDate = entry.completedAt || entry.partialCompletedAt
              return completedDate ? datesAreOnSameDay(new Date(completedDate), viewDate) : true
            })
            .map((entry, index, entries) => {
              return (
                <motion.div
                  key={entry.id}
                  className="time-track-entry-list-item"
                  layout
                  transition={{ type: "spring", duration: 0.2, bounce: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <TimeTrackEntry
                    {...entry}
                    viewDate={viewDate}
                    autoFocus={autoFocusId.current === entry.id}
                    inputRef={ref => {
                      ref
                        ? (entryInputsRef.current[entry.id] = ref)
                        : delete entryInputsRef.current[entry.id]
                    }}
                    set={update => setCollection(state => update(state.entries[index]))}
                    discard={() => setCollection(state => void state.entries.splice(index, 1))}
                    focus={direction => {
                      const previousEntry = entries[index - 1]
                      const nextEntry = collection.entries[index + 1]
                      const focusEntry = direction === "backward" ? previousEntry : nextEntry
                      const focusInput =
                        entryInputsRef.current[focusEntry?.id] || newEntryRef.current
                      focusInput?.focus()
                    }}
                    createNewAfter={() => {
                      if (index === entries.length - 1) {
                        newEntryRef.current?.focus()
                      } else {
                        setCollection(state => {
                          const id = new Date().toISOString()
                          autoFocusId.current = id
                          state.entries.splice(index + 1, 0, getNewEntry({ id }))
                        })
                      }
                    }}
                  />
                </motion.div>
              )
            })}
        </AnimatePresence>
      </div>
      <TimeTrackEntry
        inputRef={newEntryRef}
        viewDate={viewDate}
        key={"new-entry" + collection.entries.length}
        set={update => {
          const entry = produce(getNewEntry(), update)
          if (entry.description) {
            setCollection(state => void state.entries.push(entry))
            setTimeout(() => newEntryRef.current?.focus())
          }
        }}
      />

      <div>
        {collection.suggestions?.map(suggestion => (
          <div key={suggestion.id}>{suggestion.description}</div>
        ))}
      </div>
    </div>
  )
}
