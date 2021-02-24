import produce from "immer"
import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCollection } from "./stores"
import { TimeTrackEntry } from "./TimeTrackEntry"

type CollectionProps = {
  collectionKey: string
}

export function Collection({ collectionKey }: CollectionProps) {
  const autoFocusId = React.useRef<string>()
  const entryInputsRef = React.useRef<Record<string, HTMLTextAreaElement>>({})
  const newEntryRef = React.useRef<HTMLTextAreaElement>()
  const { collection, setCollection } = useCollection(collectionKey)
  if (!collection) return null

  return (
    <div>
      <div className="collection-title">{collection.displayName}</div>
      <div
        className="time-track-entry-list"
        onKeyPress={event => {
          console.log(event.key)
        }}
      >
        <AnimatePresence>
          {collection.entries?.map((entry, index, entries) => {
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
                  autoFocus={autoFocusId.current === entry.id}
                  inputRef={ref => {
                    ref
                      ? (entryInputsRef.current[entry.id] = ref)
                      : delete entryInputsRef.current[entry.id]
                  }}
                  set={update => setCollection(state => update(state.entries[index]))}
                  discard={() =>
                    setCollection(state => {
                      console.log(state.entries.splice(index, 1))
                    })
                  }
                  focus={direction => {
                    const previousEntry = entries[index - 1]
                    const nextEntry = collection.entries[index + 1]
                    const focusEntry = direction === "backward" ? previousEntry : nextEntry
                    const focusInput = entryInputsRef.current[focusEntry?.id] || newEntryRef.current
                    focusInput?.focus()
                  }}
                  createNewAfter={() => {
                    if (index === entries.length - 1) {
                      newEntryRef.current?.focus()
                    } else {
                      setCollection(state => {
                        const id = String(new Date())
                        autoFocusId.current = id
                        state.entries.splice(index + 1, 0, {
                          id,
                          description: "",
                        })
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
        key={"new-entry" + collection.entries.length}
        set={update => {
          const entry = produce({ description: "", id: String(Date.now()) }, update)
          if (entry.description) {
            setCollection(state => void state.entries.push(entry))
            setTimeout(() => newEntryRef.current?.focus())
          }
        }}
      />
    </div>
  )
}
