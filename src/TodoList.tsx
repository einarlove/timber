import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useCollectionsStore } from "./stores"
import { Collection } from "./Collection"
import { daysBetweenDates } from "./utils"
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi"
import { TimeTrackingCollection } from "../types/TimeTracking"

type TodoListProps = {
  [key: string]: unknown
}

export function TodoList(props: TodoListProps) {
  const [viewDate, setViewDate] = React.useState(new Date())
  const { collections, set } = useCollectionsStore()

  useHotkeys("cmd+shift+k", event => {
    event.preventDefault()
    const { ipcRenderer: ipc } = window.require("electron")
    ipc.invoke("reset-collections").then((collections: TimeTrackingCollection[]) => {
      useCollectionsStore.setState({ collections })
    })
  })

  return (
    <div>
      <TimelineNavigationBar date={viewDate} onChange={date => setViewDate(date)} />
      <div className="todo-list">
        {collections?.map(collection => (
          <Collection viewDate={viewDate} id={collection.id} key={collection.id} />
        ))}
      </div>

      <input
        name="displayName"
        type="text"
        style={{ marginTop: 50, border: "1px solid #ccc" }}
        onBlur={event => {
          const displayName = event.currentTarget.value
          if (displayName) {
            set(state => {
              state.collections.push({ id: new Date().toISOString(), displayName, entries: [] })
            })
          }
        }}
      />
      <details>
        <summary>State</summary>
        <pre>{JSON.stringify(collections, null, 2)}</pre>
      </details>
    </div>
  )
}

function TimelineNavigationBar({ date, onChange }: { date: Date; onChange: (day: Date) => void }) {
  const daysRelativeToNow = daysBetweenDates(date, new Date())
  const useRelative = Math.abs(daysRelativeToNow) < 2
  const offsetDate = (days: number) => {
    const newDate = new Date(date)
    newDate.setDate(date.getDate() + days)
    onChange(newDate)
  }

  useHotkeys("right", () => offsetDate(1), {}, [date])
  useHotkeys("left", () => offsetDate(-1), {}, [date])

  return (
    <div className="timeline-navigation-bar">
      <button onClick={() => offsetDate(-1)}>
        <BiLeftArrowAlt />
      </button>
      <div className="view-date">
        {useRelative
          ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(daysRelativeToNow, "days")
          : new Intl.DateTimeFormat("nb-NO", {
              weekday: "long",
              day: "numeric",
              month: "short",
            }).format(date)}
      </div>
      <button onClick={() => offsetDate(1)}>
        <BiRightArrowAlt />
      </button>
    </div>
  )
}
