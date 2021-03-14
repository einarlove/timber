import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useCollections } from "./stores"
import { Collection } from "./Collection"
import { daysBetweenDates } from "./utils"
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi"

export function TodoList() {
  const [viewDate, setViewDate] = React.useState(new Date())
  const { collections, setCollection } = useCollections()

  useHotkeys(
    "cmd+shift+k",
    event => {
      event.preventDefault()
      const { ipcRenderer: ipc } = window.require("electron")
      ipc.invoke("reset").then(() => window.location.reload())
    },
    []
  )

  return (
    <div>
      <TimelineNavigationBar date={viewDate} onChange={date => setViewDate(date)} />
      <div className="todo-list">
        {collections?.map(collection => (
          <Collection
            set={setCollection}
            collection={collection}
            viewDate={viewDate}
            key={collection.id}
          />
        ))}
      </div>
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
