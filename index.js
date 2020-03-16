const fs = require('fs')
const Path = require('path')
const loaderUtils = require('loader-utils')
const Mock = require('mockjs')
const jsonMergePatch = require('json-merge-patch')
const ejs = require("ejs")
const Freemarker = require('freemarker')
const fmEngine = new Freemarker()
const Colors = require('colors')

var options = {
  render: true,
  define: {}
}

module.exports = function(source) {
  this.cacheable && this.cacheable()

  let that = this
  let cb = that.async()

  options = jsonMergePatch.merge(
    options,
    loaderUtils.getOptions(that) ? loaderUtils.getOptions(that) : {}
  )

  if(!options.render){
    ejs.renderFile(that.resource, options.define, {}, function(err, content){
      if (err) { throw new Error(err) }
      cb(null, `module.exports = ${replaceSrc(JSON.stringify(content))}`)
    })
  } else {
    let htmls = [that.resource]
    // json文件列表
    let jsons = []
    // json文件内容
    let jsonContents = {}
    let data = {}

    // htmls = htmls.concat(getIncludeFiles(source, that.resource))
    // clearIncludes()

    htmls.forEach(function(file){
      that.addDependency(file)
      jsons.push(file.replace(/.html/, '.json'))
    })

    jsons.forEach(function(file, item){
      that.addDependency(file)
      if (fs.existsSync(file)) {
        // 清除缓存
        delete require.cache[file]
        let jsonContent = require(file)
        jsonContents = jsonMergePatch.merge(jsonContents, jsonContent)
      } else {
        console.log(Colors.red(`\nfreemarker-loader error: ${file} does not exist\n`))
      }
    })

    data = Mock.mock(jsonContents)

    ejs.renderFile(that.resource, options.define, {}, function(err, content){
      if (err) { throw new Error(err) }
      fmEngine.render(content, data, (err, html) => {
        if (err) { throw new Error(err) }
        if (!html) {
          html = content
          console.log(Colors.red(`\nfreemarker-loader error: freemarker render failed\n`))
        }
        cb(null, `module.exports = ${replaceSrc(JSON.stringify(html))}`)
      })
    })
  }
}

// 将html里的图片模块化
function replaceSrc(fileContent, exclude) {
  let reg = new RegExp('(src|data-src)=\\\\?[\'\"]([\\s\\S]*?)\\\\?[\'\"]', 'ig')
	fileContent = fileContent.replace(reg, function(str, attrName, imgUrl){
    if(!imgUrl) return str // 避免空src引起编译失败
    if(/^(http(s?):)?\/\//.test(imgUrl)) return str // 绝对路径的图片不处理
    if(!/\.(jpg|jpeg|png|gif|svg|webp|ico)/i.test(imgUrl)) return str // 非静态图片不处理
    if(exclude && imgUrl.indexOf(exclude) != -1) return str // 不处理被排除的
    // 路径开头没有./，也没有@
    if(!(/^[\.\/]/).test(imgUrl) && imgUrl.indexOf('@') < 0) {
      imgUrl = './' + imgUrl
    }
    return attrName+"=\"+JSON.stringify(require("+JSON.stringify(imgUrl)+").default)+\""
  })
  return fileContent
}

var includes = []

// 获取include的文件
function getIncludeFiles(content, path) {
  // var reg = new RegExp("<%\\s+include\\s+([\\s\\S]*?)\\s+%>", "g")
  let reg = new RegExp("<%-\\s+include\\(\\s*[\'\"]([\\s\\S]*?)[\'\"][,\\s*]*([\\s\\S]*?)\\)\\s+%>", "g")

  path = Path.dirname(path)

  content.replace(reg, function(a,b){
    let filePath = Path.resolve(path, b)
    if(fs.existsSync(filePath)){
      includes.push(filePath)
      getIncludeFiles( fs.readFileSync(filePath,'utf8'), filePath )
    }else{
      console.log(Colors.red(`\nfreemarker-loader error: ${filePath} does not exist\n`))
    }
  })

  return includes
}

function clearIncludes() {
  includes = []
}
