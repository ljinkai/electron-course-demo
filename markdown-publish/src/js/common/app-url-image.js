var http = require('http');
var fs = require('fs');
const util = require('./app-util');
const fsExtra = require('fs-extra')
const Path = require('path');

/**
 * @ ajax 请求获取base64格式
 * @param {String}    url 需要请求的图片的连接
 * @return {Promise}  promise对象
 */
const getBase = (url) => {
	return new Promise((resolve, reject) => {
	  $.ajax(url, {
		  xhrFields: {
			responseType: 'blob', // 指定响应数据类型为blob格式
		  },
		})
		.then(blob => {
		  let reader = new FileReader();
		  reader.onloadend = function () {
			resolve(reader.result)
		  };
		  reader.readAsDataURL(blob);
		})
		.catch(error => {
		  reject(error)
		});
	})
}

/**
 * @ base64转化为对应的文件
 * @param {String}  base  base64字符
 * @param {String}  name  文件名称
 * @return: {file} 返回的文件
 */
const base64toFile = (base, name) => {
	var arr = base.split(',');
	var mime = arr[0].match(/:(.*?);/)[1];
	var bstr = atob(arr[1]);
	var n = bstr.length;
	var u8arr = new Uint8Array(n);
	while (n--) {
	  u8arr[n] = bstr.charCodeAt(n);
	}
	//转换成file对象
	return new File([u8arr], name, {
	  type: mime
	});
}

/**
 * @ 图片转化为文件类型
 * @param {String} url  请求图片的地址
 * @param {String} name 转换后的文件名称
 * @return: {file}
 */
const imgUrlToFile = async (url, name = 'file') => {
	let fileObj = {};
	console.log("imgUrlToFile:", url)
	await getBase(url).then(base => {
	  fileObj = base64toFile(base, name);
	})
	return fileObj;
}

/**
 * source : https://www.jianshu.com/p/28e3de79fd49
 * @param {} url
 */
const getUrlImageAndSaveToTmp = async (url) => {
	return new Promise(function (resolve,reject) {
		http.get(url, function (req, res) {
			var imgData = '';
			var baseUrl = url.split("?")[0]
			var name = Path.basename(baseUrl)
			console.log("图片后缀：", name)
			req.setEncoding('binary');
			req.on('data', function (chunk) {
				imgData += chunk;
			});
			req.on('end', function () {
				fs.writeFile(`src/tmp/${name}`, imgData, 'binary', function (err) {
					if (err) {
						console.log('保存出错！');
						reject(err)
					} else {
						console.log('保存成功!');
						var resUrl = util.relativePath('src/tmp/', name);
						resolve(resUrl)
					}
				});
			});
		})
	})
}

/**
 * 清空临时目录
 * @returns
 */
const clearLocalTmp = async () => {
	return fsExtra.emptyDirSync('src/tmp')
}

exports.imgUrlToFile = imgUrlToFile
exports.getUrlImageAndSaveToTmp = getUrlImageAndSaveToTmp
exports.clearLocalTmp = clearLocalTmp

