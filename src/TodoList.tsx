import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useCollectionsStore } from "./stores"
import { Collection } from "./Collection"
import { daysBetweenDates } from "./utils"

type TodoListProps = {
  [key: string]: unknown
}

export function TodoList(props: TodoListProps) {
  const [viewDate, setViewDate] = React.useState(new Date())
  const collections = useCollectionsStore(state => state.collections)

  return (
    <div>
      <TimelineNavigationBar date={viewDate} onChange={date => setViewDate(date)} />
      <div className="todo-list">
        {collections?.map(collection => (
          <Collection viewDate={viewDate} id={collection.id} key={collection.id} />
        ))}
      </div>
      {/* <pre>{JSON.stringify(collections, null, 2)}</pre> */}
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
      <button onClick={() => offsetDate(-1)}>←</button>
      <div className="view-date">
        {useRelative
          ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(daysRelativeToNow, "days")
          : new Intl.DateTimeFormat("nb-NO", {
              weekday: "long",
              day: "numeric",
              month: "short",
            }).format(date)}
      </div>
      <button onClick={() => offsetDate(1)}>→</button>
    </div>
  )
}
