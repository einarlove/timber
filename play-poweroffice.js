const { webkit } = require("playwright")
const fetch = require("node-fetch")

;(async () => {
  console.time()
  const browser = await webkit.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto("https://go.poweroffice.net")
  await page.fill("#Email", "einar@unfold.no")
  await page.fill("#Password", "Muligvarighet92$")
  await page.click('input[type="submit"]')
  const credentialsCookies = await context.cookies()

  const result = await fetch(
    "https://go.poweroffice.net/api/timetracking/timesheet/timesheet/week?weekNo=6&year=2021",
    {
      headers: {
        cookie: credentialsCookies.map(cookie => `${cookie.name}=${cookie.value}`).join(";"),
      },
    }
  )

  // const { data } = await result.json()
  // console.log(data.lines.reduce((timesheet, line) => {
  //   if (!timesheet[line.subprojectCode]) timesheet[line.subprojectCode] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map()

  //   ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].reduce((weekdays, weekday) => {
  //     weekdays[weekday] = line[weekday.slice(0, 3)]
  //     return weekdays
  //   }, {})
  //   return timesheet
  // }, {}))

  // await page.goto("https://go.poweroffice.net/#timetracking/timesheet?%24clientid=2b085152-55a4-4b42-938f-b8133c93e806&noddate=2021-02-13&viewtype=1")
  // await page.waitForTimeout(1000)
  // await page.screenshot({ path: `after-click.png` })
  await browser.close()
  console.timeEnd()
})()
