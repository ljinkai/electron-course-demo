<template>
  <div class="fixed w-full top-0 left-0 h-full flex items-center justify-center bg-black bg-opacity-50" ref="choose_dialog">
      <div class="w-full max-w-sm bg-white rounded-lg py-8 px-4 text-center relative">
        <i class="iconfont icon-delete1 cursor-pointer absolute top-0 right-0 text-3xl" @click="closeView"></i>
        <div class="flex justify-between mt-4">
          <input class="border h-10 w-50 p-2" v-model="code" placeholder="输入完整股票代码"/>
          <div @click="getStockList" class="border px-4 flex items-center rounded cursor-pointer ml-2">
            <i class="iconfont icon-search mr-1"></i>搜索
          </div>
        </div>
        <div class="flex justify-between items-center mt-4 bg-gray-100 p-2" v-for="item in dataList" :key="item.index">
          <div class="flex justify-between flex-col">
            <div class="text-left">股票:{{item.name}}({{item.code}})</div>
            <div class="text-left mt-2">价格:{{item.price}}</div>
            <div class="text-left mt-2">
              增幅监听比例:<i class="ml-4 iconfont cursor-pointer" @click="increaseClick('min')">&#xe66d;</i><input class="w-12 ml-1 text-right px-2 border border-gray-200 rounded h-8" v-model="increase"/>% <i class="iconfont cursor-pointer" @click="increaseClick('add')">&#xe67b;</i>
            </div>
            <div class="text-left mt-2">
              降幅监听比例:<i class="ml-4 iconfont cursor-pointer" @click="decreaseClick('min')">&#xe66d;</i><input class="w-12 ml-1 text-right px-2 border border-gray-200 rounded h-8" v-model="decrease"/>% <i class="iconfont cursor-pointer" @click="decreaseClick('add')">&#xe67b;</i>
            </div>
          </div>
          <div @click="saveStock" class="border px-4 py-1 flex items-center rounded cursor-pointer ml-2">
            <i class="iconfont icon-kaiqilingsheng mr-1 text-xl"></i>监听
          </div>
        </div>
      </div>
  </div>
</template>


<script>
import axios from 'axios'
// let { ipcRenderer } = require('electron');
export default {
  name: "DialogAdd",
  props: {
    stocks: {
      type: Array
    }
  },
  data() {
    return {
      code: '',
      increase: 0,
      decrease: 0,
      dataList: []
    }
  },                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
  methods: {
    getStockList() {//sh600036
      this.dataList = []
      axios.get(`http://hq.sinajs.cn/list=${this.code}`).then((res)=> {
        if (res && res.status == 200) {
          var text = res.data
          if (text.indexOf("=") > 0) {
            let arr = []
            arr = text.split("=")[1].split(",")
            const tmp = {'name': arr[0].split('"')[1].trim(), 'code': this.code, 'price':arr[3]};
            this.dataList.push(tmp)
          }
        }
        console.log(res)
      })

      // const tmp = {'name': '浦发银行', 'code': '600006', 'price':'34.45'};
      // this.dataList.push(tmp)
    },
    async saveStock() {
      if (this.code.length > 0) {
        var tmp = {name:this.dataList[0].name, code:this.code, price:this.dataList[0].price, increase:this.increase, decrease: this.decrease, listen: true};
 
        this.$emit('active-data', tmp)
      }
    },
    increaseClick(str) {
      if (str == 'add') {
        this.increase = this.increase + 0.5
      } else if (str == 'min') {
        if (this.increase < 1) {
          this.increase = 0;
        } else {
          this.increase = this.increase - 0.5
        }
      }
    },
    decreaseClick(str) {
      if (str == 'min') {
        this.decrease = this.decrease - 0.5
      } else if (str == 'add') {
        if (this.decrease > -1) {
          this.decrease = 0;
        } else {
          this.decrease = this.decrease + 0.5
        }
      }
    },
    closeView() {
      this.$emit('add-close')
    }
  }
}
</script>
