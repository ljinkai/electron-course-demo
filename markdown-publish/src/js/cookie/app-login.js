const {BrowserWindow, session} = require('electron');
// const https = require('https');
// const jsDom = require("jsdom");
const icon = require('../common/app-icon');
const DataStore = require('../app-store');
const dataStore = new DataStore();

//登录相应网站获取Cookie通用方法
function getSiteCookie(url, callback) {
    let win = new BrowserWindow(
        {width: 700, height: 600, icon: icon.iconFile, title: '【登陆成功后关闭窗口即可完成设置】'});
    win.loadURL(url).then();
    win.on('close', () => {
        // 查询所有与设置的 URL 相关的所有 cookies.
        session.defaultSession.cookies.get({url: url})
            .then((cookies) => {
                let cookieString = '';
                for (let cookie of cookies) {
                    cookieString += cookie.name + '=' + cookie.value + '; '
                }
                callback(cookieString.trim())
            }).catch((error) => {
            console.log(error)
        });
        win = null
    });
    win.on('page-title-updated', (e) => {
        //阻止窗口标题更改
        e.preventDefault()
    })
}

// 登录简书
const loginJianShu = function () {
    getSiteCookie('https://www.jianshu.com/sign_in', (cookie) => {
        dataStore.setJianShuCookies(cookie) // 保存网站信息到本地存储，为发布做准备
    })
};

exports.loginJianShu = loginJianShu;
