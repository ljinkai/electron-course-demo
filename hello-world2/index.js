const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let win = null;
app.on('ready', () => {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true // 页面内集成Node.js环境
        }
    });
    win.loadFile('index.html');
    win.on('close', () => {
        win = null
    });
})
app.on('window-all-closed', () => {
    app.quit();
})