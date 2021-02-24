import React from "react"
import AutosizeTextarea from "react-autosize-textarea"
import { TimeTrackingEntry } from "../../types/TimeTracking"

type TimeTrackEntryProps = Partial<TimeTrackingEntry> & {
  set: (update: (entry: TimeTrackingEntry) => void) => void
  discard?: () => void
  autoFocus?: boolean
  // focusPrevious?: () => void
  // focusNewEntry?: () => void
  focus?: (direction: "backward" | "forward" | "new") => void
  createNewAfter?: () => void
  inputRef: React.Ref<HTMLTextAreaElement | undefined>
}

export function TimeTrackEntry(props: TimeTrackEntryProps) {
  return (
    <div className="time-track-entry">
      <AutosizeTextarea
        ref={props.inputRef}
        autoFocus={props.autoFocus}
        className="reset-input time-track-entry--input"
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
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            event.currentTarget.blur()
            props.createNewAfter?.()
            // props.focus?.("forward")
          }
          if (event.key === "Backspace" && !event.repeat && !event.currentTarget.value) {
            event.preventDefault()
            props.focus?.("backward")
          }
        }}
        onBlur={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
          const value = event.currentTarget.value
          if (value) {
            if (value !== props.description) {
              props.set(entry => void (entry.description = value.trim()))
            }
          } else if (props.discard) {
            props.discard()
          }
        }}
      />
    </div>
  )
}
