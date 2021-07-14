'use strict'

import { app, protocol, BrowserWindow, ipcMain , Menu, Tray, contentTracing} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
let path = require('path');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
let win = null
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      enableRemoteModule: true, // <--- added
    }
  })

  // 添加自定义菜单
  let tmpMenuArr = [{
    label: "菜单1",
    submenu: [{label: "菜单1-1"},{label: "菜单1-2"}]
  },{
    label: "菜单2",
    submenu: [{
      label: "菜单2-1",
      click() {
        console.log("click:菜单2-1")
      }
    },{label: "菜单2-2", role: 'paste'}]
  }];
  if (process.platform === 'darwin') {
    tmpMenuArr.unshift({label: ''})
  }
  let menu = Menu.buildFromTemplate(tmpMenuArr);
  Menu.setApplicationMenu(menu);


  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  // 监听窗口关闭消息
  win.on('close', event => {
    win.webContents.send('fromMainToRender-close')
    event.preventDefault()
  })
}

// 监听渲染进程发送的确认关闭窗口消息
ipcMain.on('msgFromRenderToMain-close', (event) => {
  console.log("主进程:收到确认关闭消息")
  win.destroy()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // Mac系统下应用程序关闭所有窗口后不退出，而是驻留在Dock栏，此处做判断
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
// Electron专门为Mac系统下提供的事件active, 当点击应用程序时触发此事件
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let tray;
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  (async () => {
    await contentTracing.startRecording({
      included_categories: ['*']
    })
    console.log('Tracing started')
    await new Promise(resolve => setTimeout(resolve, 5000))
    const path = await contentTracing.stopRecording()
    console.log('Tracing data recorded to ' + path)
  })()

  createWindow()

  // 设置托盘图标
  let iconPath = path.normalize(path.join(__dirname, '..', 'src/assets/img/icon.png'));//path.join(__dirname, 'strawberry.png');
	tray = new Tray(iconPath)
})



// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
