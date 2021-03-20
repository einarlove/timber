import { exec } from "child_process"
import { addDays } from "date-fns"

import { TimeTrackingCollection, GitCommitEntry } from "../../types/TimeTracking"
import { time } from "../log"

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
): Promise<GitCommitEntry[]> => {
  const timer = time("git", "Get suggestions")
  return new Promise((resolve, reject) =>
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
        if (error) {
          timer.reject(error)
          return reject(error)
        }

        const suggestions = output
          .split("\n")
          .filter(l => l)
          .reduce((suggestions, line) => {
            const [, hash, completedAt, description, ref] = line.match(/(.*)•(.*)•(.*)•(.*)/) || []
            const isPullRequest = /\(#\d.*?\)$/.test(description)

            if (!isPullRequest) {
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

        timer.resolve()
        resolve(suggestions)
      }
    )
  )
}
