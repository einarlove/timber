export type Settings = {
  powerOfficeAccount?: PowerOfficeAccount
  calendars?: string[]
}

export type PowerOfficeAccount = {
  username: string
  password: string
}
