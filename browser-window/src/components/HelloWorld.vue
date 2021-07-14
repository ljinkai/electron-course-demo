<template>
  <div class="hello">
    <section>
    <h2>窗口</h2>
    <div class="flex items-center justify-center align-middle">
      <button class="bg-red-500 hover:bg-red-400 rounded p-2 m-2 text-white" @click="winMax">最大化窗口</button>
      <button class="bg-red-500 hover:bg-red-400 rounded p-2 m-2 text-white" @click="winMin">最小化窗口</button>
      <button class="bg-red-500 hover:bg-red-400 rounded p-2 m-2 text-white" @click="winClose">关闭窗口</button>
    </div>
    <div class="flex items-center justify-center align-middle">
      <button class="bg-red-500 hover:bg-red-500 rounded p-2 m-2 text-white" @click="winModal">父子窗口</button>
    </div>
    <div v-if="this.unloadFlag" class="fixed top-1/2 left-1/2 rounded shadow-lg transform -translate-y-2/4 -translate-x-2/4 p-5 border border-gray-300">
      <div class="font-medium">确定关闭当前页面吗？</div>
      <p class="m-5">当前修改将不会被保存</p>
      <div class="flex justify-end">
        <button class="bg-red-500 text-sm rounded p-1 m-2 text-white" @click="winDestroy">离开</button>
        <button class="bg-red-500 text-sm rounded p-1 m-2 text-white" @click="unloadFlag=false">取消</button>
      </div>
    </div>
    </section>
    
    
    <section>
      <h2>对话框</h2>
      <div>
        <button class="bg-red-500 text-sm rounded p-1 m-2 text-white" @click="dialogFileOpen">打开文件选择对话框</button>
      </div>
    </section>
  </div>
</template>

<script>
let { remote, ipcRenderer } = require("electron");
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      unloadFlag: false
    }
  },
  mounted() {
    ipcRenderer.on('fromMainToRender-close', (event) => {
      console.log(event.sender)
      this.unloadFlag = true
    })
  },
  created() {
    // window.onbeforeunload = () => {
    //   this.unloadFlag = true
    //   return false
    // }
    this.addRightMenu()
  },
  methods: {
    winMax() {
      remote.getCurrentWindow().maximize()
    },
    winMin() {
      remote.getCurrentWindow().minimize()
    },
    winClose() {
      remote.getCurrentWindow().close()
    },
    winDestroy() {
      // 确认离开动作后发送消息给主进程
      ipcRenderer.send('msgFromRenderToMain-close')
    },
    winModal() {
      const child = new remote.BrowserWindow({
        width: 300,
        height: 300,
        parent: remote.getCurrentWindow(),
        center: true,
        webPreferences: {
          nodeIntegration: true,
        },
        backgroundColor: '#eee'
      });
      var theUrl = 'app://./modal.html'
      console.log('url', theUrl);
      // child.loadURL(theUrl)
      const modalPath = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080/modal.html#/miniWindow'
    : `file://${__dirname}/modal.html#miniWindow`
      child.loadURL(modalPath)
      child.once('ready-to-show', () => {
        child.show()
      })
    },
    async dialogFileOpen() {
      const { dialog, app } = require("electron").remote;
       dialog.showOpenDialog({
        title: "打开文件",
        // 确认按钮显示的文本
        buttonLable: "点击打开文件",
        defaultPath: app.getPath('pictures'),
        // 数组格式，允许多选，还可以设置是否允许选择文件夹、是否只允许单选等
        properties: ['openFile', 'multiSelections'],
        // 允许文件打开的类型，可以设置一个数组设定文件打开的类型
        filters: [
          {name: "Images", extensions: ["jpg", "png", "gif"]},
          {name: "Movies", extensions: ["mkv", "avi", "mp4"]}
        ]
      }).then(result => {
        console.log(result)
      });
    },
    addRightMenu() {
      let { Menu } = remote;
      let menu = Menu.buildFromTemplate([
        { label: "右键菜单1",
          click() {
            alert('点我了')
          }	
        },
        { label: "菜单2"},
        { label: "菜单3"}
      ]);
      window.oncontextmenu = function(e) {
        e.preventDefault();
        menu.popup();
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
