# freemarker-loader

## 简介

`freemarker-loader`能够解析html文件中的`freemarker`语法和ejs语法。如果标签有`src`或`data-src`属性，且属性值为相对路径，那么`freemarker-loader`会解析相对路径，以供`webpack`依赖打包。

## Webpack

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

## 示例

#### 目录结构

````
+ src
  - xxx.png
  - index.html
  - index.json
````

#### src/data-src

````
# index.html

# 相对路径
<img src="./xxx.png" />

# 别名（"@":"src路径"）
<img src="@/xxx.png" />
````

#### 配置mock数据

新建一个与html文件同名且同级的json文件。`freemarker-loader`能够解析json文件的`mockjs`语法。

## 注意

1、运行前，安装java JDK，配置java环境变量。

2、运行前，将shell切换为bash。
