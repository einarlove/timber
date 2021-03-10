import React from "react"
import AutosizeTextarea from "react-autosize-textarea"
import { BiCheck } from "react-icons/bi"

import { TimeTrackingEntry } from "../types/TimeTracking"

type TimeTrackEntryProps = Partial<TimeTrackingEntry> & {
  set: (update: (entry: TimeTrackingEntry) => void) => void
  discard?: () => void
  autoFocus?: boolean
  // focusPrevious?: () => void
  // focusNewEntry?: () => void
  focus?: (direction: "backward" | "forward" | "new") => void
  createNewAfter?: () => void
  defaultChecked?: boolean
  viewDate: Date
  inputRef: React.Ref<HTMLTextAreaElement>
}

export function TimeTrackEntry(props: TimeTrackEntryProps) {
  const checkboxRef = React.useRef<HTMLInputElement>(null)
  return (
    <div className="time-track-entry">
      <label className="time-track-entry-checkbox">
        <input
          type="checkbox"
          ref={checkboxRef}
          defaultChecked={Boolean(props.completedAt || props.partialCompletedAt) || false}
          onChange={event =>
            props.set(entry => {
              entry.completedAt = event.currentTarget.checked
                ? props.viewDate.toISOString()
                : undefined
            })
          }
        />
        <BiCheck />
      </label>
      <AutosizeTextarea
        ref={props.inputRef}
        autoFocus={props.autoFocus}
        className="time-track-entry-input"
        defaultValue={props.description}
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
            if (event.metaKey) checkboxRef.current!.checked = true
            event.currentTarget.blur()
            props.createNewAfter?.()
            // props.focus?.("forward")
          }
          if (event.key === "Backspace" && !event.repeat && !event.currentTarget.value) {
            event.preventDefault()
            console.log("dis")
            props.focus?.("backward")
          }
        }}
        onBlur={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
          const value = event.currentTarget.value
          if (value) {
            if (value !== props.description) {
              props.set(entry => {
                if (checkboxRef.current!.checked && !entry.completedAt) {
                  entry.completedAt = new Date().toISOString()
                }
                entry.description = value.trim()
              })
            }
          } else if (props.discard) {
            props.discard()
          }
        }}
      />
    </div>
  )
}
