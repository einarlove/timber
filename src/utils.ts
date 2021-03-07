export const daysBetweenDates = (a: Date, b: Date) => {
  return Math.ceil((a.getTime() - b.getTime()) / (1000 * 3600 * 24))
}

export const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate()
