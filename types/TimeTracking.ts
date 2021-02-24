export type TimeTrackingCollection = {
  key: string
  displayName: string
  connection?: unknown
  entries: TimeTrackingEntry[]
}

export type TimeTrackingEntry = {
  id: string
  description: string
}
