import { exec } from "child_process"
import path from "path"
import { CalendarEventEntry } from "../../../types/TimeTracking"
import { time } from "../../log"

export type Event = {
  id: string
  title: string
  startDate: string
  endDate: string
  calendar: string
}

async function getEvents(calendars: string[], startDate: Date, endDate: Date): Promise<Event[]> {
  return new Promise((resolve, reject) =>
    exec(
      `START_DATE=${startDate.toISOString()} END_DATE=${endDate.toISOString()} CALENDARS=${calendars.join(
        ","
      )} swift ${path.join(__dirname, "get-events.swift")}`,
      (error, output) => {
        if (error) return reject(error)
        const json = JSON.parse(output)
        resolve(json)
      }
    )
  )
}

export async function getEventSuggestions(
  calendars: string[],
  startDate: Date,
  endDate: Date
): Promise<CalendarEventEntry[] | undefined> {
  const timer = time("calendar", "Get suggestions")
  try {
    const events = await getEvents(calendars, startDate, endDate)
    timer.resolve()
    return events.map(event => ({
      id: event.id,
      source: "calendar-event",
      calendar: event.calendar,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.title,
    }))
  } catch (error) {
    timer.reject(error)
  }
}

export const getCalendars = async () => {
  const timer = time("calendar", "Get calendars")
  return new Promise((resolve, reject) =>
    exec(`swift ${path.join(__dirname, "get-calendars.swift")}`, (error, output) => {
      if (error) return timer.reject(error)
      const json = JSON.parse(output)
      timer.resolve()
      resolve(json)
    })
  )
}
