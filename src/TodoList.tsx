import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import groupBy from "lodash.groupby"
import { useCollections, useEntriesByDay, useSuggestionsByDay } from "./stores"
import { Collection } from "./Collection"
import { daysBetweenDates } from "./utils"
import { BiCalendar, BiGitBranch, BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi"
import { AnimatePresence, motion } from "framer-motion"
import { format } from "date-fns"
import { Settings } from "../types/settings"
import { Calendar } from "../types/connections"

const { ipcRenderer: ipc } = window.require("electron")

export function TodoList() {
  const [settingsIsOpen, setSettingsIsOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(new Date())
  const { collections, setCollection } = useCollections()
  const { suggestions } = useSuggestionsByDay(viewDate, collections)
  const { entries, addEntry, setEntry, removeEntry } = useEntriesByDay(viewDate)
  const unrelatedSuggestions = suggestions?.filter(
    suggestion => !suggestion.collectionId && !entries?.some(entry => entry.id === suggestion.id)
  )

  useHotkeys(
    "cmd+shift+k",
    event => {
      event.preventDefault()
      ipc.invoke("reset").then(() => window.location.reload())
    },
    []
  )

  const [calendars, setCalendars] = React.useState<Calendar[]>()
  const [settings, setSettings] = React.useState<Settings>()
  React.useEffect(() => {
    ipc.invoke("get-calendars").then(setCalendars)
  }, [])
  React.useEffect(() => {
    ipc.invoke("get-settings").then(set => setSettings(set))
  }, [])

  if (settingsIsOpen)
    return (
      <>
        <button onClick={() => setSettingsIsOpen(false)} style={{ margin: 20 }}>
          ← Back
        </button>
        <div
          style={{
            display: "grid",
            gap: 60,
            padding: "40px 20px",
            justifyItems: "stretch",
          }}
        >
          <fieldset>
            <legend>PowerOffice</legend>
            <form
              onSubmit={event => {
                event.preventDefault()
                const usernameNode = event.currentTarget.elements.namedItem(
                  "username"
                ) as HTMLInputElement
                const passwordNode = event.currentTarget.elements.namedItem(
                  "password"
                ) as HTMLInputElement

                ipc
                  .invoke("set-settings", {
                    ...settings,
                    powerOfficeAccount: {
                      username: usernameNode.value,
                      password: passwordNode.value,
                    },
                  } as Settings)
                  .then(() => {
                    ipc.invoke("get-settings").then(setSettings)
                  })

                console.log(usernameNode.value, passwordNode.value)
              }}
            >
              <input
                placeholder="Username"
                name="username"
                defaultValue={settings?.powerOfficeAccount?.username}
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                defaultValue={settings?.powerOfficeAccount?.password}
              />
              <button type="submit">Lagre</button>
            </form>
          </fieldset>

          <fieldset>
            <legend>Calenders</legend>
            <div>
              {Object.entries(groupBy(calendars, "source")).map(([source, calendars]) => (
                <fieldset key={source}>
                  <legend>{source}</legend>
                  {calendars.map(calendar => (
                    <div className="calendar" key={calendar.name}>
                      <input
                        type="checkbox"
                        value={calendar.id}
                        checked={settings?.calendars?.includes(calendar.id)}
                        onChange={event => {
                          ipc
                            .invoke("set-settings", {
                              ...settings,
                              calendars: event.currentTarget.checked
                                ? [...(settings?.calendars || []), calendar.id]
                                : settings?.calendars?.filter(c => c !== calendar.id),
                            })
                            .then(() => {
                              ipc.invoke("get-settings").then(setSettings)
                            })
                        }}
                      />
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            backgroundColor: calendar.color,
                            marginRight: 8,
                            borderRadius: "100%",
                          }}
                        />
                        {calendar.name}
                      </div>
                    </div>
                  ))}
                </fieldset>
              ))}
            </div>
          </fieldset>
          <div
            style={{
              display: "grid",
              gap: 20,
              justifyItems: "flex-start",
            }}
          >
            <button
              onClick={() => {
                entries?.forEach(entry => removeEntry(entry))
              }}
            >
              Delete entries for {viewDate.toDateString()}
            </button>
            <button
              onClick={() => {
                ipc.invoke("reset").then(() => window.location.reload())
              }}
            >
              Reset all data
            </button>
          </div>
        </div>
      </>
    )

  return (
    <>
      <TimelineNavigationBar date={viewDate} onChange={date => setViewDate(date)} />
      <div className="todo-list">
        {collections?.map(collection => (
          <Collection
            set={setCollection}
            collection={collection}
            viewDate={viewDate}
            key={collection.id}
            addEntry={addEntry}
            setEntry={setEntry}
            removeEntry={removeEntry}
            suggestions={suggestions?.filter(
              suggestion =>
                suggestion.collectionId === collection.id &&
                !entries?.some(entry => entry.id === suggestion.id)
            )}
            entries={entries?.filter(entry => entry.collectionId === collection.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {Boolean(unrelatedSuggestions?.length) && (
          <div>
            <div className="suggestions-title">Unrelated</div>
            <motion.div
              className="suggestions"
              transition={{ type: "spring", duration: 0.2, bounce: 0 }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "auto" }}
            >
              {unrelatedSuggestions?.map(suggestion => (
                <label className="suggestion" key={suggestion.id}>
                  <select
                    className="select-overlay"
                    value=""
                    onChange={event => {
                      if (event.currentTarget.value) {
                        addEntry({
                          ...suggestion,
                          collectionId: event.currentTarget.value,
                          completedAt: viewDate.toISOString(),
                        })
                      }
                    }}
                  >
                    <option disabled value="">
                      Add to collection
                    </option>
                    {collections?.map(collection => (
                      <option key={collection.id} value={collection.id}>
                        {collection.displayName}
                      </option>
                    ))}
                  </select>
                  {suggestion.description}{" "}
                  {suggestion.source === "git-commit" && (
                    <span className="suggestion-branch">
                      <BiGitBranch /> {suggestion.branch}
                    </span>
                  )}
                  {suggestion.source === "calendar-event" && (
                    <span className="suggestion-branch">
                      <BiCalendar />
                      <span style={{ marginBottom: -2 }}>
                        {format(new Date(suggestion.startDate), "HH:mm")}–
                        {format(new Date(suggestion.endDate), "HH:mm")}
                      </span>
                    </span>
                  )}
                </label>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <button onClick={() => setSettingsIsOpen(true)} style={{ margin: "40px 0" }}>
        Settings
      </button>
    </>
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

  useHotkeys("right", event => !event.repeat && offsetDate(1), {}, [date])
  useHotkeys("left", event => !event.repeat && offsetDate(-1), {}, [date])

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
