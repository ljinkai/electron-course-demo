'use strict'

import { app, BrowserWindow, Menu, Tray, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const icon = require('./common/app-icon');
const sc = require('./common/app-schedule');
const Store = require('./common/app-store');
const isDevelopment = process.env.NODE_ENV !== 'production'

const store = new Store()
// Scheme must be registered before the app is ready
// protocol.registerSchemesAsPrivileged([
//   { scheme: 'app', privileges: { secure: true, standard: true } }
// ])
let mainWindow;
let tray;

app.on('ready', () => {
    // 隐藏系统任务栏
    hiddenTaskbar();
    // 创建托盘
    createTray();
    // 执行周期任务
    sc.excuteSchedule();
});

function createTray() {
    // 新建系统托盘并添加图标
    tray = new Tray(icon.iconFile);
    // 悬停通知
    tray.setToolTip('Hello Stock Tweet');
    // 绑定点击事件
    tray.on('click',(evt, bounds) => {
      if (!mainWindow) {
        // 创建主窗口
        createWindow()
      }
      // 显示无边框显示窗口
      createUnframeWindow(evt, bounds);
    })
}

function hiddenTaskbar() {
    switch (process.platform) {
        case "win32":
            Menu.setApplicationMenu(null);
            break;
        case "darwin":
            app.dock.hide();
            break
    }
}

function createUnframeWindow(evt, bounds) {
  const { x, y } = bounds;
    const { width, height } = mainWindow.getBounds();
    // if (mainWindow.isVisible()) {
    //   mainWindow.hide();
    // } else {
      mainWindow.setBounds({
        x: x - (width / 2),
        y: process.platform === 'darwin' ? y : y - height,
        width,
        height,
      });
      mainWindow.show();
      // 发送消息刷新到渲染进程，刷新数据列表
      mainWindow.send('refreshStocks');
      // notify.showNotification();
    // }
}

async function createWindow() {
  // 创建 browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // 开发模式下加载webpack下的文件
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // 非开发模式下的加载index.html
    mainWindow.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (BrowserWindow.getAllWindows().length === 0) createWindow()
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

// 监听渲染进程发送的获取本地存储股票信息接口
ipcMain.handle('getStoreValue', (event, key) => {
	return store.getStocks();
});
// 监听渲染进程发送的存储股票信息至本地存储
ipcMain.handle('setStoreValue', (event, key, value) => {
	return store.setStocks(value);
});
// 退出应用
ipcMain.handle('quitApp', (event, key, value) => {
	app.quit()
});



