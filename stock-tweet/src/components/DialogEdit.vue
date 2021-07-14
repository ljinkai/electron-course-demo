<template>
  <div class="fixed w-full top-0 left-0 h-full flex items-center justify-center bg-black bg-opacity-50" ref="choose_dialog">
      <div class="w-full max-w-sm bg-white rounded-lg py-8 px-4 text-center relative">
          <i class="iconfont icon-delete1 cursor-pointer absolute top-0 right-0 text-3xl" @click="closeView"></i>
          <div class="">
            <div class="text-left">股票:<span class="ml-2">{{stock.name}}({{stock.code}})</span></div>
            <div class="text-left mt-2">价格:<input class="w-12 ml-1 text-right px-2 border border-gray-200 rounded h-8" type="text" v-model="stock.price"></div>
            <div class="text-left mt-2">现价:<span class="ml-2">{{stock.nowPrice}}</span></div>
            <div class="text-left mt-2">
              增幅监听比例:<i class="ml-4 iconfont cursor-pointer" @click="increaseClick('min')">&#xe66d;</i><input class="w-12 ml-1 text-right px-2 border border-gray-200 rounded h-8" v-model="stock.increase"/>% <i class="iconfont cursor-pointer" @click="increaseClick('add')">&#xe67b;</i>
            </div>
            <div class="text-left mt-2">
              降幅监听比例:<i class="ml-4 iconfont cursor-pointer" @click="decreaseClick('min')">&#xe66d;</i><input class="w-12 ml-1 text-right px-2 border border-gray-200 rounded h-8" v-model="stock.decrease"/>% <i class="iconfont cursor-pointer" @click="decreaseClick('add')">&#xe67b;</i>
            </div>
          </div>
          <div @click="saveStock" class="border px-4 py-1 flex items-center justify-center text-center rounded cursor-pointer ml-2 mt-4">
            保存
          </div>
      </div>
  </div>
</template>


<script>
// let { ipcRenderer } = require('electron');
export default {
  name: "DialogEdit",
  props: {
    stock: {
      type: Object
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
    async saveStock() {
        // DataStore.saveStock(arr)
        // var flag = await ipcRenderer.invoke('setStoreValue', 'local-stocks', arr);
        // console.log(flag)
        this.$emit('active-data', this.stock)
        this.closeView()
    },
    increaseClick(str) {
      if (str == 'add') {
        this.stock.increase = this.stock.increase + 0.5
      } else if (str == 'min') {
        if (this.stock.increase < 1) {
          this.stock.increase = 0;
        } else {
          this.stock.increase = this.stock.increase - 0.5
        }
      }
    },
    decreaseClick(str) {
      if (str == 'min') {
        this.stock.decrease = this.stock.decrease - 0.5
      } else if (str == 'add') {
        if (this.stock.decrease > -1) {
          this.stock.decrease = 0;
        } else {
          this.stock.decrease = this.stock.decrease + 0.5
        }
      }
    },
    closeView() {
      this.$emit('edit-close')
    }
  }
}
</script>
