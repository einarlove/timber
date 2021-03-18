import { exec } from "child_process"
import path from "path"
import { CalendarEventEntry } from "../../types/TimeTracking"

export type Event = {
  id: string
  title: string
  startDate: string
  endDate: string
  calendar: string
}

async function getEvents(startDate: Date, endDate: Date): Promise<Event[]> {
  return new Promise((resolve, reject) =>
    exec(
      `START_DATE=${startDate.toISOString()} END_DATE=${endDate.toISOString()} swift ${path.join(
        __dirname,
        "get-calendar-events.swift"
      )}`,
      (error, output) => {
        if (error) return reject(error)
        const json = JSON.parse(output)
        resolve(json)
      }
    )
  )
}

export async function getEventSuggestions(
  startDate: Date,
  endDate: Date
): Promise<CalendarEventEntry[]> {
  const events = await getEvents(startDate, endDate)
  console.log(events)
  return events.map(event => ({
    id: event.id,
    source: "calendar-event",
    calendar: event.calendar,
    startDate: event.startDate,
    endDate: event.endDate,
    description: event.title,
  }))
}
