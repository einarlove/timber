import { exec } from "child_process"
import { addDays } from "date-fns"
import { TimeTrackingCollection, GitCommitEntry } from "../../types/TimeTracking"

export const getCollectionGitSuggestions = async (
  collection: TimeTrackingCollection,
  fromDate: Date,
  toDate: Date
): Promise<GitCommitEntry[]> => {
  if (!collection.repositories) return []
  const suggestions = await Promise.all(
    collection.repositories.map(repo => {
      return getGitSuggestions(repo.directory, fromDate, toDate)
    })
  )
  return suggestions.flat().map(entry => ({ ...entry, collectionId: collection.id }))
}

const getGitSuggestions = async (
  directory: string,
  fromDate: Date,
  toDate: Date
): Promise<GitCommitEntry[]> =>
  new Promise((resolve, reject) =>
    exec(
      `cd ${directory} && git log --all --after="${fromDate
        .toISOString()
        .slice(0, 10)}" --before="${addDays(toDate, 1)
        .toISOString()
        .slice(
          0,
          10
        )}" --no-merges --author=$(git config user.email) --pretty="format:%h•%ci•%s•%S"`,
      (error, output) => {
        if (error) return reject(error)
        resolve(
          output
            .split("\n")
            .filter(l => l)
            .reduce((suggestions, line) => {
              console.log(line)
              const [, hash, completedAt, description, ref] =
                line.match(/(.*)•(.*)•(.*)•(.*)/) || []
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
            }, [] as GitCommitEntry[])
        )
      }
    )
  )