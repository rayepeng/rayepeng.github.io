---
title: 'flask——渲染页面'
date: 2019-01-01
category: 'python'
tags: []
lang: 'zh'
draft: true
---
一直纠结于flask是如何渲染页面的

现在再来理一理

# base.html

![](https://upload-images.jianshu.io/upload_images/10651191-5d53f49bffea423b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

使用 `url_for`函数来得到资源的URL

同时加载了`styke.css`文件（自己写的）

![](https://upload-images.jianshu.io/upload_images/10651191-832d81434c838d5c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是
Home所在的黑框框是怎么出现的呢

![](https://upload-images.jianshu.io/upload_images/10651191-8c40327977e56435.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

原来Home所在的标签是`nav`

![](https://upload-images.jianshu.io/upload_images/10651191-2ffe9dba66807005.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在 `style.css`文件中进行了定义

![](https://upload-images.jianshu.io/upload_images/10651191-2ded852a4ac7360e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是bootstrap又是如何被引入的呢？

# Jinja2 的常见三种语法

{%   %}  书写语句

{{...}} 书写表达式

{#   #} 书写注释
