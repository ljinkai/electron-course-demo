const string = require('../common/app-string');
const DataStore = require('../app-store');
const dataStore = new DataStore();
const appToast = require('../common/app-toast');

// cookie登录校验
exports.loginCheck = (site) => {
    switch (site) {
        case string.jianshu:
            if (!dataStore.getJianShuCookies()) {
                appToast.toast({title: '请先登录简书',body:''});
                return false
            }
            break;
        default:
            appToast.toast({title: '未注册检查类型'});
            return false
    }
    return true
};
