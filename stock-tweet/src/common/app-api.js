const DataStore = require('./app-store');
const axios = require('axios')
let store = new DataStore()

const API = {
  /**
   * 比较最新的股票价格和当前存储的股票价格，并返回股票数据
   * @returns resArray
   */
  async getRateStocks() {
    var stocks = store.getStocks();

    var queryStocks = []
    // 已经存储的股票信息
    for (var i = 0; i < stocks.length; i++) {
      var tmp = stocks[i];
      console.log("excuteSchedule",tmp)
      queryStocks.push(tmp.code)
    }
    // 读取最新的股票信息
    const response = await axios.get(`http://hq.sinajs.cn/list=${queryStocks.join(',')}`, {
      headers: { 'content-type': 'text/javascript; charset=gbk' },
    });
    // const response_1 = `var hq_str_sh601658="邮储银行,5.940,5.940,5.240,5.970,5.780,5.830,5.840,114417301,669315295.000,570300,5.830,1057321,5.820,1106800,5.810,1683400,5.800,684600,5.790,82473,5.840,521800,5.850,508100,5.860,384200,5.870,503700,5.880,2021-03-19,15:00:00,00,";`
    if (response && response.data) {
      const response_1 = response.data
      console.log(response_1);
      var resArray = []
      var arrStocks = response_1.split(";")

      arrStocks.forEach((item, i) => {// 循环每只股票
        let savedStock = stocks[i]
        let arr = [];
        let tmp = null
        if (item.indexOf("=") > 0) {// 拆分读取
          console.log(1)
          arr = item.split("=")[1].split(",");
          // 返回值里的中文名称有编码问题，取本地已经存储的名字
          tmp = { 'name': savedStock.name, 'code': item.split("=")[0].split("str_")[1],'price': arr[3], listen: savedStock.listen};
          
          // 判断价格高低
          var minus = tmp.price - savedStock.price
          var rate = ((minus/savedStock.price)*100).toFixed(2)
          console.log('savedStock:', savedStock, minus)
          
          if ((rate >= savedStock.increase) || (rate <= savedStock.decrease)) {
            tmp['nowRate'] = `${rate}%`
            resArray.push(tmp);
          }

          savedStock["nowPrice"] = tmp.price
          savedStock["nowRate"] = rate
          stocks[i] = savedStock
        }
      })
      store.setStocks(stocks)
    }
    return resArray
  }
}
module.exports = API