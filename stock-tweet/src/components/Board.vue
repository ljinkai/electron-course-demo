<template>
  <div class="">
    <div class="flex justify-end mb-4">
      <div @click="addNew" class="flex border px-4 py-1 items-center rounded cursor-pointer ml-2 mr-2">
        <i class="iconfont mr-1">&#xe65e;</i> 添加
      </div>
      <div @click="exit" class="flex border px-4 py-1 items-center rounded cursor-pointer ml-2 mr-2">
        <i class="iconfont mr-1">&#xe60c;</i> 退出应用
      </div>
    </div>
    <div class="flex justify-between p-2 bg-gray-50 border-b bordr-gray-100">
      <div class="w-2/5">名称</div>
      <div class="w-1/5">价格</div>
      <div class="w-1/5">比例</div>
      <div class="w-1/5">操作</div>
    </div>
    <div class="flex justify-between p-2 bg-gray-50 items-center" v-for="item in stocks" :key="item.index">
      <div class="w-2/5">{{item.name}}({{item.code}})</div>
      <div class="w-1/5">
        <div>{{item.price}}</div>
        <div v-if="item.nowPrice">(现价:{{item.nowPrice}})</div></div>
      <div class="w-1/5">
        <div>增:{{item.increase}}</div>
        <div>减:{{item.decrease}} </div>
        <div v-if="item.nowRate">现:{{item.nowRate}}%</div>
      </div>
      <div class="w-1/5">
        <i class="iconfont icon-edit cursor-pointer" @click="editItem(item)"></i>
        <i class="iconfont icon-delete cursor-pointer ml-4" @click="deleteItem(item)"></i>
        <i class="iconfont icon-kaiqilingsheng cursor-pointer text-xl ml-4" @click="listenItem(item, true)" v-if="item.listen"></i>
        <i class="iconfont icon-guanbilingsheng cursor-pointer text-xl ml-4" @click="listenItem(item, false)" v-if="!item.listen"></i>
      </div>
    </div>
    <dialog-add v-if="showAddFlag" :stocks="stocks" v-on:active-data="activeData" v-on:add-close="showAddFlag = false"/>
    <dialog-edit v-if="showEditFlag" :stock="editItemObject" v-on:active-data="activeData" v-on:edit-close="showEditFlag = false"/>
    
  </div>
</template>

<script>
// 比亚迪：sz002594

let { ipcRenderer } = require('electron');
import DialogAdd from './DialogAdd.vue'
import DialogEdit from './DialogEdit.vue'


export default {
  name: 'Board',
  components: {
        DialogAdd,
        DialogEdit
  },
  data() {
      return {
        showAddFlag: false,
        showEditFlag: false,
        editItemObject: null,
        stocks: []
      }
  },
  mounted() {
    this.getStock()
    this.listener()
  },
  methods: {
    listener() {
      // 监听 refreshStocks 事件
      ipcRenderer.on('refreshStocks', () => {
        this.getStock()
      });
    },
    async getStock() {
      // 发送消息给主进程，获取本地存储信息
      const stocks = await ipcRenderer.invoke('getStoreValue', 'local-stocks');
      if (stocks) {
        this.stocks = stocks
      }
    },
    addNew() {
      this.showAddFlag = true
    },
    /**
     * 添加，修改股票信息的监听回调
     */
    async activeData(item) {
      var haveItem = false
      for (var i = 0; i < this.stocks.length; i++) {
        var tmp = this.stocks[i]
        if (tmp.code == item.code) {
          this.stocks[i] = item
          haveItem = true
        }
      }
      if (!haveItem) {
        this.stocks.push(item)
      }
      // 发送消息给主进程，将修改后的数据更新存储到本地
      await ipcRenderer.invoke('setStoreValue', 'local-stocks', this.stocks);
      this.getStock()
      this.showAddFlag = false
    },
    /**
     * 删除某个股票信息
     */
    async deleteItem(item) {
      console.log(item)
      this.stocks = this.stocks.filter(({ code }) => code !== item.code)
      await ipcRenderer.invoke('setStoreValue', 'local-stocks', this.stocks);
    },
    editItem(item) {
      console.log(item)
      this.editItemObject = item
      this.showEditFlag = true
    },
    /**
     * 开启、关闭监听的图标点击事件
     */
    async listenItem(item, listen) {
      for (var i = 0; i < this.stocks.length; i++) {
        var obj = this.stocks[i]
        if (obj.code == item.code) {
            this.stocks[i]["listen"] = !listen
        }
      }
      await ipcRenderer.invoke('setStoreValue', 'local-stocks', this.stocks);
    },
    /**
     * 退出应用
     */
    async exit() {
      await ipcRenderer.invoke('quitApp');
    }
  }
}
</script>

<style scoped>
</style>
