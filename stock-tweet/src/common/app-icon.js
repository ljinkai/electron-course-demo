const {nativeTheme} = require('electron');
const path = require('path');

// 系统托盘图标目录 __dirname:主进程文件所在目录
let iconDir = path.normalize(path.join(__dirname , '..' ,'public/resource'));
if (process.env.WEBPACK_DEV_SERVER_URL) {
} else {
  iconDir = path.normalize(path.join(__dirname ,''));
}
function icon() {
    // 按平台选择图标的文件名，mac是18px的倍数，win是16px的倍数
    const iconName = process.platform === 'win32' ? 'star-win.png' : nativeTheme.shouldUseDarkColors
                                                                     ? 'star-mac.png'
                                                                     : 'star-mac-dark.png';
    const iconNameBig = process.platform === 'win32' ? 'star-win.@3xpng' : nativeTheme.shouldUseDarkColors
                                                                     ? 'star-mac@3x.png'
                                                                     : 'star-mac-dark@3x.png';
    // 图标的绝对路径
    const iconFile = path.normalize(path.join(iconDir, iconName));
    const iconFileBig = path.normalize(path.join(iconDir, iconNameBig));
    return {iconFile, iconFileBig}
}

exports.iconFile = icon().iconFile;
exports.iconFileBig = icon().iconFileBig;
exports.icon = icon;