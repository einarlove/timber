export type TimeTrackingCollection = {
  id: string
  displayName: string
  repositories?: GitConnection[]
  project?: PowerOfficeConnection
  entries: TimeTrackingEntry[]
  suggestions?: TimeTrackingEntry[]
}

export type TimeTrackingEntry = {
  id: string
  description: string
  completedAt?: string
  partialCompletedAt?: string
} & (
  | {
      source: "git-commit"
      branch?: string
    }
  | {
      source?: never
    }
)

type PowerOfficeConnection = {
  projectId: string
  activityId: string
}

export type GitConnection = {
  directory: string
  name: string
}
