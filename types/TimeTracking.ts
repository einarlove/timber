export type TimeTrackingCollection = {
  id: string
  displayName: string
  repositories?: GitConnection[]
  project?: PowerOfficeConnection
}

type BaseEntry = {
  id: string
  description: string
  completedAt?: string
  collectionId?: string
  partialCompletedAt?: string
}

export type BasicEntry = BaseEntry & {
  source?: never
}

export type GitCommitEntry = BaseEntry & {
  source: "git-commit"
  branch?: string
}

export type CalendarEventEntry = BaseEntry & {
  source: "calendar-event"
  startDate: string
  endDate: string
  calendar: string
}

export type TimeTrackingEntry = BasicEntry | GitCommitEntry | CalendarEventEntry

type PowerOfficeConnection = {
  projectId: string
  activityId: string
}

export type GitConnection = {
  directory: string
  name: string
}

export type Calendar = {
  id: string
  name: string
  color: string
  parent: string
}
