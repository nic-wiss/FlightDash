const {app,BrowserWindow, Menu, ipcMain}=require('electron')
const $ = require('jquery')
const path=require('path')
const url=require('url')

let mainWindow
let loginWindow
let settingsWindow
let menu

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file',
    slashes: true
  }))

  mainWindow.on('closed', function(){
    app.quit()
  })

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });


  loginWindow = new BrowserWindow({
    width: 450,
    height: 350,
    title: 'Login',
    webPreferences: {
      nodeIntegration: true
    },
    frame: false
  })

  loginWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'login.html'),
    protocol: 'file',
    slashses: true
  }))
})

ipcMain.on('login-attempt', function(e, arg) {
  mainWindow.show()
  loginWindow.hide()
})

ipcMain.on('created-account', function (e, arg) {
  loginWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'login.html'),
    protocol: 'file',
    slashses: true
  }))
})

ipcMain.on('window-receive', function(e, arg) {
  if(arg === 'minimize') {
    mainWindow.minimize()
  }
  else if(arg === 'maximize') {
    if(!mainWindow.isMaximized()) {
      mainWindow.maximize()
    }
    else {
      mainWindow.unmaximize()
    }
  }
  else if(arg === 'close') {
    app.quit()
  }
  else {}
})
