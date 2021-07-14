const Store = require('electron-store');

// 存储的数据key
JianShuCookieKey = 'jianShu-cookie-key';

class DataStore extends Store {
    constructor(settings) {
        const baseConfig = {name: 'markdown-publish'};
        const finalConfig = {...baseConfig, ...settings};
        super(finalConfig)
    }

    /*
     * 简书Cookie
     */
    getJianShuCookies() {
        if (this.has(JianShuCookieKey)) {
            return this.get(JianShuCookieKey)
        }
        return null
    }
    setJianShuCookies(v) {
        return this.set(JianShuCookieKey, v)
    }

}

module.exports = DataStore;
