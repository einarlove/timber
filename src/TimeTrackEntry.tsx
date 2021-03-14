import React from "react"
import AutosizeTextarea from "react-autosize-textarea"
import { BiCheck } from "react-icons/bi"

import { TimeTrackingEntry } from "../types/TimeTracking"

type TimeTrackEntryProps = {
  entry: TimeTrackingEntry
  set: (entry: TimeTrackingEntry) => void
  discard?: () => void
  autoFocus?: boolean
  focus?: (direction: "backward" | "forward" | "new") => void
  createNewAfter?: () => void
  defaultChecked?: boolean
  viewDate: Date
  inputRef: React.Ref<HTMLTextAreaElement>
}

export function TimeTrackEntry({
  entry,
  set,
  discard,
  viewDate,
  inputRef,
  autoFocus,
  createNewAfter,
  focus,
}: TimeTrackEntryProps) {
  const checkboxRef = React.useRef<HTMLInputElement>(null)
  return (
    <div className="time-track-entry">
      <label className="time-track-entry-checkbox">
        <input
          type="checkbox"
          ref={checkboxRef}
          defaultChecked={Boolean(entry.completedAt || entry.partialCompletedAt) || false}
          onChange={event =>
            set({
              ...entry,
              completedAt: event.currentTarget.checked ? viewDate.toISOString() : undefined,
            })
          }
        />
        <BiCheck />
      </label>
      <AutosizeTextarea
        ref={inputRef}
        autoFocus={autoFocus}
        className="time-track-entry-input"
        defaultValue={entry.description}
        spellCheck="false"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="Today I did…"
        // Move cursor to the end of line on focus
        onFocus={(event: React.FocusEvent<HTMLTextAreaElement>) => {
          const input = event.currentTarget
          input.selectionStart = input.selectionEnd = input.value.length
        }}
        // If Enter is pressed, update. Allow line-breaks with shift key
        onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (event.key === "Escape") {
            event.currentTarget.blur()
          }
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            if (event.metaKey) checkboxRef.current!.checked = !checkboxRef.current!.checked
            event.currentTarget.blur()
            createNewAfter?.()
          }
          if (event.key === "Backspace" && !event.repeat && !event.currentTarget.value) {
            event.preventDefault()
            focus?.("backward")
          }
        }}
        onBlur={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
          const value = event.currentTarget.value
          if (value) {
            if (value !== entry.description) {
              set({
                ...entry,
                description: value.trim(),
              })
            }
          } else if (discard) {
            discard()
          }
        }}
      />
    </div>
  )
}
