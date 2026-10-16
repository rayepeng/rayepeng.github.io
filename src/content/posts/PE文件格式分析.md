---
title: 'PE文件格式分析'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
之前学到的很多PE文件都忘的差不多了
这次正好复习一下：

在NT影响头中，引入表的RVA
![](https://upload-images.jianshu.io/upload_images/10651191-a3995360edb13ab7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

就是指向了IDT表
![](https://upload-images.jianshu.io/upload_images/10651191-e28022d7f534eeb6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其实我们这次只需要引入user32.dll就行了
第一个指向INT， INT再指向一个字符串
中间一个指向user32.dll字符串
最后一个指向IAT
虽然在文件中是一摸一样的，但是之后IAT就会放地址
