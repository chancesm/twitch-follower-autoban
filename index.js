const axios = require('axios');
require('dotenv').config()
const { app, ipcMain, BrowserWindow } = require('electron')
const Store = require('electron-store');
const express = require('express');
const morgan = require('morgan');
const ngrok = require('ngrok');
const qs = require('qs');


const store = new Store();
const auth = store.get('twitchAuth');
const appAuth = store.get('appAuth');

const TwitchClientId = process.env.TWITCH_CLIENT_ID
const TwitchClientSecret = process.env.TWITCH_CLIENT_SECRET
const TWITCH_API = 'https://id.twitch.tv/oauth2/token'

const { webhookRouter } = require('./webhooks/index.js');
const TwitchApi = require('./services/twitch-api');

let authWindow
let appWindow

const eApp = express()
eApp.use(express.json())
eApp.use(morgan('dev'))
eApp.use('/webhooks', webhookRouter)
eApp.get('/authRedirect', (req, res) => {
  const code = req.query.code;
  twitchAuthLogin(code)
  res.send('Thank you for logging in! You can close this window now')
})
eApp.listen(8081, () => {
  console.log('Webserver listening...')
})

ngrok.connect(8081).then(url => {
  store.set('ngrokURL', url)
})


async function twitchAuthLogin(code) {
  const authParams = qs.stringify({
    client_id: TwitchClientId,
    client_secret: TwitchClientSecret,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'http://localhost:8081/authRedirect'
  })
  const url = `${TWITCH_API}?${authParams}`
  axios.post(url)
  .then(saveTwitchAuthAndStartApp)
  .catch((reason) => {
    // Add better error handling (CLOSE THE APP)
    console.log(reason)
  })
}

async function saveTwitchAuthAndStartApp(response) {
  const now = Date.now()
  const twitchAuth = response.data;
  store.set('twitchAuth', {
    accessToken: twitchAuth.access_token,
    refreshToken: twitchAuth.refresh_token,
    expires_in: twitchAuth.expires_in,
    expires: now + (twitchAuth.expires_in * 1000)
  })
  authWindow.close()
  createAppWindow()
  authenticateApp()
}

function authenticateApp() {
  const appAuthParams = qs.stringify({
    client_id: TwitchClientId,
    client_secret: TwitchClientSecret,
    grant_type: 'client_credentials',
    scope: 'channel:moderate chat:edit chat:read'
  })
  axios.post(`${TWITCH_API}?${appAuthParams}`)
    .then(init)
    .catch((reason) => console.log(reason))
}
async function init(response) {
  const now = Date.now()
  const twitchAuth = response.data;
  store.set('appAuth', {
    accessToken: twitchAuth.access_token,
    refreshToken: twitchAuth.refresh_token,
    expires_in: twitchAuth.expires_in,
    expires: now + (twitchAuth.expires_in * 1000)
  })
  startApp()
}
async function startApp() {
  const twitchApi = new TwitchApi()
  await twitchApi.registerWebhooks()

}

function createAppWindow() {
  appWindow = new BrowserWindow({
    width: 800,
    height: 600
  })

  appWindow.loadFile('views/app.html')
}
function createAuthWindow() {
  authWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 800,
    height: 600
  })
  authWindow.loadFile('views/auth.html')
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
  
  if (auth !== undefined && appAuth !== undefined) {
    createAppWindow()
    authenticateApp()
  } else {
    createAuthWindow()
  }
})
