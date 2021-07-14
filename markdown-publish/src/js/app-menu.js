const {dialog} = require('electron');
const appPublish = require('./app-publish.js');
const appDialog = require('./common/app-localFile');
const appCheck = require('./cookie/app-check.js');
const appToast = require('./common/app-toast.js');

/**
 * 发布内容到博客平台
 * @param {*} param0
 * @returns
 */
function publishArticleTo(event, {title, text, site, isPublish, dirname}) {
    if (!appCheck.loginCheck(site)) {
        return
    }

    let handler = function () {
            const content = text;
			console.log("menu-publish:", dirname)
            appPublish.publishArticleTo({title, content, dirname, site, isPublish})
                .then(url => {
                    console.log('发布文章到', site, '成功：', title);
                    appToast.openPublishUrl(url, title); // 发布成功提示
                    // 调用自身
                    // setTimeout(handler, sleep ? sleep : 1000)
					event.sender.send('publish-result', 'ok')
                }).catch(reason => {
					// logger.log('发布文章到', site, '失败：', title, reason.toString());
					// TODO:是否重试
					const n = dialog.showMessageBoxSync({
						message: `《${title}》\n${reason.toString()}`,
						buttons: ['取消']
					});
					event.sender.send('publish-result', 'fail')
            	})
    };
    handler()
}
exports.publishArticleTo = publishArticleTo;


/**
 * 选择本地文件
 * @returns 文件数据对象
 */
async function selectFileToOpen() {
    // 1.选择本地文件
    const result = appDialog.openSingleLocalFileSync();
    if (result.canceled) {
        return
    }
    // 2.选择本地文件并返回文件对象
    const files = result.files;
    let number = 0;
	var object = {}
    // 获取第一个文件
    let i = 0;
	if (i < files.length) {
		const title = files[i].title;
		const content = files[i].content;
		const dirname = files[i].dirname;
		i++;
		object = {title, content, dirname}
	}
	return object
}
exports.selectFileToOpen = selectFileToOpen;
