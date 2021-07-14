const util = require('./common/app-util');
const string = require('./common/app-string');
const fs = require('fs');
const appUrlImage = require('./common/app-url-image');
const jianshu = require('./blog/jianshu');
const Path = require('path');

// 发布文章到平台
const publishArticleTo = ({title, content, dirname, site, isPublish}) => {
    return new Promise(async (resolve, reject) => {
        // 1.参数校验
        if (title == null || title.length < 1) {
            reject('文章标题为空')
        }
        if (content == null || content.length < 1) {
            reject('文章内容为空')
        }
        if (site == null || site.length < 1) {
            reject('站点为空')
        }
        // 2.上传图片
        let list = [];
		// 获取文章内的图片链接
        util.readImgLink(content, (src) => {
            list.push(src)
        });
        let text = content;
        let mark = {next: true};
        for (let src of list) {
			var filePath = ""
			console.log("图片路径：", src)
            if (util.isLocalPicture(src)) { // 本地图片
                //图片的真实路径
				filePath = decodeURIComponent(util.relativePath(dirname, src));
				console.log("图片的相对本地路径local：",filePath)
			} else if (util.isWebPicture(src)){// 网络图片
				console.log("图片路径：", src)
				// 获取到网络图片并存放到临时目录
				filePath = await appUrlImage.getUrlImageAndSaveToTmp(src).then((file) => {
					console.log("图片路径转化后：", file)
					return file
				})
				console.log("图片的相对本地路径：",filePath)
			}
			// return false;

			// 非本地图片不上传
			// if (!fs.existsSync(all_src)) {
			//     continue
			// }
			if (filePath.length == 0) {
				continue
			}
			switch (site) {
				case string.jianshu:
					await jianshu.uploadPictureToJianShu(filePath)
						.then(value => {
							text = text.replace(`[${src}]`, `[${value.toString()}]`) // 替换图片的alt
							text = text.replace(`(${src})`, `(${value.toString()})`) // 替换图片的路径
						})
						.catch(reason => {
							console.log("出问题了：", reason)
							mark.next = false;
							reject(reason.toString())
						});
					break;
			}
        }
        if (!mark.next) {
            return
        }
        // 3.发布文章
        switch (site) {
            case string.jianshu:
                await jianshu.publishArticleToJianshu(title, text, isPublish)
                    .then(async (url) => {
						await appUrlImage.clearLocalTmp() // 清空下临时目录图片
                        resolve(url)
                    })
                    .catch(reason => {
                        reject(reason)
                    });
                break
        }
    })
};
exports.publishArticleTo = publishArticleTo;
