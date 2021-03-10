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
      `cd ${directory} && git log --all --after="2021-02-20" --before="2021-03-27" --no-merges --author=$(git config user.email) --pretty="format:%h•%ci•%s•%S"`,
      (error, output) => {
        if (error) return reject(error)
        resolve(
          output.split("\n").reduce((suggestions, line) => {
            const [, hash, completedAt, description, ref] = line.match(/(.*)•(.*)•(.*)•(.*)/) || []
            const isRemote = ref.startsWith("refs/remotes/")
            const isPullRequest = /\(#\d.*?\)$/.test(description)

            if (!isRemote && !isPullRequest) {
              suggestions.push({
                id: hash,
                completedAt,
                description,
                source: "git-commit",
                branch: ref?.match(/([^/]+$)/)?.[0],
              })
            }

            return suggestions
          }, [] as TimeTrackingEntry[])
        )
      }
    )
  )
