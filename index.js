const { app, BrowserWindow } = require('electron')
const Store = require('electron-store');
const {ipcMain} = require('electron')

const store = new Store();
const auth = store.get('twitchAuth');

console.log("AUTH: ", auth)
console.log("STORED: ", app.getPath('userData'))

function createAppWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('views/app.html')
}
function createAuthWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 800,
    height: 600
  })

  win.loadFile('views/auth.html')
}
function createTwitchLoginWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 1000
  })

  win.loadURL("https://id.twitch.tv/oauth2/authorize?client_id=w76aukjogv9gxtcwcccyoc6ce7sguv&redirect_uri=http://localhost:8081/authRedirect&response_type=code&scope=user:manage:blocked_users")
}
ipcMain.on('twitch-login', () => {
  createTwitchLoginWindow()
})
app.whenReady().then(() => {
  if (auth === undefined) {
    // store.set('twitchAuth', 'something')
    createAuthWindow()
  } else {
    createAppWindow()
  }
})