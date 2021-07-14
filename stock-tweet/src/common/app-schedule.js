const {Notification} = require('electron');
const schedule = require('node-schedule');
const API = require('./app-api');
const icon = require('./app-icon');

module.exports = {
  /**
   * 定时任务比较最新价格和本地存储的股票价格
   */
  excuteSchedule: () => {
    schedule.scheduleJob('*/1 * * * *', async () => {
      let rateStocks = await API.getRateStocks();
      // 设置系统通知
      console.log("sc::", rateStocks, icon.iconFile)
      rateStocks.forEach(element => {
        if (element.listen) {
          const notification = {
            title: `${element.name}(${element.code}) 价格提醒`,
            icon: icon.iconFileBig,
            body: `当前价格为：${element.price} \n幅度为：${element.nowRate}`
          }
          new Notification(notification).show()
        }
      });
    });
  }
}