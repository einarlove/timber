export type TimeTrackingCollection = {
  id: string
  displayName: string
  repositories?: GitConnection[]
  project?: PowerOfficeConnection
  suggestions?: TimeTrackingEntry[]
}

export type TimeTrackingEntry = {
  id: string
  description: string
  completedAt?: string
  collectionId?: string
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
