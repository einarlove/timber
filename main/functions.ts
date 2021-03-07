import { exec } from "child_process"
import { TimeTrackingCollection, TimeTrackingEntry } from "../types/TimeTracking"

export const getCollectionGitSuggestions = async (
  collection: TimeTrackingCollection
): Promise<TimeTrackingEntry[]> => {
  if (!collection.repositories) return []
  const suggestions = await Promise.all(
    collection.repositories.map(repo => {
      return getGitSuggestions(repo.directory)
    })
  )
  return suggestions.flat()
}

const getGitSuggestions = async (directory: string): Promise<TimeTrackingEntry[]> =>
  new Promise((resolve, reject) =>
    exec(
      `cd ${directory} && git log --after="2021-02-20" --before="2021-03-27" --no-merges --author=$(git config user.email) --pretty="format:%h•%ci•%s"`,
      (error, output) => {
        if (error) return reject(error)
        resolve(
          output.split("\n").map(line => {
            const [, hash, completedAt, description] = line.match(/(.*)•(.*)•(.*)/) || []
            return { id: hash, completedAt, description }
          })
        )
      }
    )
  )
