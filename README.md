# freemarker-loader

## 简介

解析html文件中的freemarker语法和ejs语法。如果在html文件中有使用到src属性或data-src属性，且属性值为相对路径，那么该相对路径会被解析，以供webpack依赖打包。

## 环境配置

1、先安装java环境

2、修改fmpp文件的JAVA_HOME配置，文件路径为./node_modules/freemarker/fmpp/bin/fmpp

````
默认值
JAVA_HOME=/System/Library/Frameworks/JavaVM.framework/Home

改成已安装好的JAVA_HOME路径，例如
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home
````

## webpack

````
{
  test: /\.html$/,
  use: [
    {
      loader: 'freemarker-loader',
      options: {
        render: true, // 是否解析freemarker语法
        define: {     // 定义ejs全局变量
          'process.env.NODE_ENV': process.env.NODE_ENV
        }
      }
    }
  ]
}
````

## HTML

````
# 假设目录结构为

+ src
  + assets
   - xxx.png
+ public
  - index.html
  - index.json
````

### 配置src或data-src
````
# index.html

# 相对路径
<img src="../src/assets/xxx.png" />

# 别名（"@":"src路径"）
<img src="@/assets/xxx.png" />
````

### 配置freemarker数据

新建一个json文件，与html文件同名且同级目录。该json文件支持mockjs语法。
