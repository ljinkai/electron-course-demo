const Store = require('electron-store');

const localStocks = 'local-stocks'
class DataStore extends Store {
  constructor(settings) {
    const baseConfig = {name: 'stock-tweet'};
    const finalConfig = {...baseConfig, ...settings};
    super(finalConfig)
  }
  setStocks(v) {
    return this.set(localStocks, v)
  }
  getStocks() {
      if (this.has(localStocks)) {
          return this.get(localStocks)
      }
      return null
  }
}
module.exports = DataStore