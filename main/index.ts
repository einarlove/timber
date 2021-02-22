import { app, BrowserWindow } from 'electron'
import { is } from 'electron-util'

let mainWindow: BrowserWindow
async function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Timber",
    width: 500,
    height: 800,
    fullscreenable: false,
    frame: false,
    resizable: false,
    webPreferences: {
      devTools: is.development,
      nodeIntegration: true,
    }
  })

  if (is.development) {
    mainWindow.loadURL('http://localhost:' + process.env.PORT)
  } else {
    console.log('prod')
  }
}

app.on('ready', createMainWindow)
app.on('window-all-closed', () => {
  if (is.macos) app.quit()
})

app.on('activate', () => {
  if (!mainWindow) createMainWindow()
})
