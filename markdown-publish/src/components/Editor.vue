<template>
	<div class="container">
		<div id="menu" style="border-bottom: 1px #d9d9d9 solid;">
			<a-row type="flex" justify="space-between">
				<a-col>
					<a-row type="flex">
						<a-col :order="1">
							<a-button type="link" block @click="openFile">
								<FileMarkdownOutlined/>
								打开本地文件
							</a-button>
						</a-col>
						<a-col :order="2">
							<a-button type="link" block @click="loginToJianshu">
								<LoginOutlined/>
								登录
							</a-button>
						</a-col>
						<a-col :order="3">
							<a-button type="link" block @click="publishToJianshu">
								<CloudUploadOutlined/>
								发布到简书
							</a-button>
						</a-col>
					</a-row>
				</a-col>
				<a-col>
					<a-row type="flex">
						<a-col style="float:right">
							<a-select default-value="default" @change="styleChange">
								<a-select-option value="default">默认样式</a-select-option>
								<a-select-option value="github">github</a-select-option>
								<a-select-option value="night">night</a-select-option>
								<a-select-option value="gothic">gothic</a-select-option>
							</a-select>
						</a-col>
					</a-row>
				</a-col>
			</a-row>
		</div>
		<a-row type="flex">
			<a-col :span="12" >
				<div class="textContainer" id="textContainer">
					<input v-model="mdTitle" id="textTitle" class="textTitle" placeholder="标题"/>
					<textarea class="editor" id="textareaId1" data-id="md-area" autocapitalize="none"
					autocomplete="off" autofocus spellcheck="false" v-model="mdTxt" @input="mdChange"></textarea>
				</div>
			</a-col>
			<a-col :span="12">
				<div class="markedContainer" id="markedId1">
					<div class="markedTitle">{{mdTitle}}</div>
					<div id="markedContent" class="md2html" v-html="renderMD"></div>
				</div>
			</a-col>
		</a-row>
		<a-spin size="large" class="pageLoading" v-if="pageLoading"/>
	</div>
</template>
<script>
let { ipcRenderer } = require('electron');
const marked = require('markdown-it')({
                                          html: true,
                                          xhtmlOut: true,
                                          typographer: true
                                      })
import { Row, Col, Spin , Select} from 'ant-design-vue';
import { FileMarkdownOutlined, LoginOutlined, CloudUploadOutlined } from '@ant-design/icons-vue';
const Tab = require('../js/Tab.js')

export default {
	name: 'Editor',
	components: {
		"a-row": Row,
		"a-col":Col,
		"a-spin": Spin,
		"a-select": Select,
		"a-select-option": Select.Option,
		FileMarkdownOutlined,
		LoginOutlined,
		CloudUploadOutlined
	},
	props: {
		msg: String
	},
	data() {
		return {
			renderMD: '',
			tabMain: null,
			dirname: '',
			mdTitle: '',
			mdTxt: '',
			pageLoading: false,
			styleTheme: 'default'
		}
	},
	mounted() {
		this.cutHTMLStyle("default")
	},
	created() {
		setTimeout(() => {
			this.resize()
			this.scrollHandler()
			ipcRenderer.on('publish-result', (event, arg) => {
				console.log(event, arg)
				this.pageLoading = false // 隐藏加载图标
			})
		},500)
	},
	methods: {
		/**
		 * 编辑区输入时，同步显示预览区内容
		 */
		mdChange() {
			this.renderMD = marked.render(this.mdTxt)
		},
		cutHTMLStyle(name) {
			document.getElementById('html-style').href = './css/' + name + '.css'
		},
		styleChange(value) {
			this.cutHTMLStyle(value)
		},
		/**
		 * 编辑区绑定滚动事件
		 */
		scrollHandler() {
			this.tabMain = new Tab('1', 'text', document);
			this.tabMain.getTextarea().addEventListener("scroll", () => {
				const height = this.tabMain.getTextarea().scrollHeight - this.tabMain.getTextarea().clientHeight
				const proportion = this.tabMain.getTextarea().scrollTop / height
				const markedHeight = this.tabMain.getMarked().scrollHeight - this.tabMain.getMarked().clientHeight
				console.log("scroll", height, proportion, markedHeight)

				this.tabMain.getMarked().scrollTop = markedHeight * proportion;
			})
		},
		/**
		 * 发布内容到简书
		 */
		async publishToJianshu() {
			this.pageLoading = true
			await ipcRenderer.invoke('publishArticle', 'jianshu', this.mdTitle, this.mdTxt, this.dirname);
		},
		/**
		 * 选择本地文件打开
		 */
		async openFile() {
			var object = await ipcRenderer.invoke('openFile');
			this.mdTitle = object.title
			this.mdTxt = object.content
			this.dirname = object.dirname
			this.renderMD = marked.render(this.mdTxt)
		},
		/**
		 * 先登录简书账号
		 */
		async loginToJianshu() {
			await ipcRenderer.invoke('startLogin', 'jianshu');
		},
		/**
		 * 修正内容容器大小
		 */
		resize() {
			var hei = document.getElementById("menu").clientHeight
			var documentHei = window.innerHeight;
			console.log('hei:',hei, documentHei)
			var fixHei = documentHei - hei - 1
			var textObj = document.getElementById("textContainer")
			textObj.style.height = fixHei+ 'px'
			var textObjHei = document.getElementById("textTitle").clientHeight
			var textAreaObj = document.getElementById("textareaId1")
			textAreaObj.style.height = (fixHei - textObjHei -1) + 'px'

			var markedObj = document.getElementById("markedId1")
			markedObj.style.height = fixHei + 'px'
		}
	}
}
</script>

<style scoped>
	.pageLoading {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%,-50%);
	}
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
	.textTitle {
		width: 100%;
		font-size: 20px;
		padding: 6px 15px;
		border: none;
		border-bottom: 1px solid #f5f5f5
	}
	.editor {
		width: 100%;
		box-shadow: none;
		padding: 20px;
		border: 0 !important;
		height: 100%;
		border-radius: 0;
		resize: none;
		font-size: 16px;
		color: #444;
		overflow-y: auto;
	}
	.editor:focus {
		outline: none;
		box-shadow: none;
	}
	.markedTitle {
		font-size: 20px;
		padding: 10px 0px;
		font-weight: bold;
	}
	.textContainer {
		border-right: 1px solid #d9d9d9;
		height: 100vh;
	}
	.markedContainer {
		width: 100%;
		height:100vh;
		overflow-y: auto;
		word-wrap: break-word;
		word-break: break-all;
		display: block;
		color: #444;
		padding: 0 20px;
		font-size: 16px;
		background-color: #fcfaf2;
	}
</style>
