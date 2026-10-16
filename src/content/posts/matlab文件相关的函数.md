---
title: 'matlab文件相关的函数'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
官方的`fwrite`函数文档

![fwrite](https://upload-images.jianshu.io/upload_images/10651191-91bbd845dffd89aa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

并且给出了一个示例：

![example](https://upload-images.jianshu.io/upload_images/10651191-8968622c7895c4a1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

写入一个随机的双精度数，使用的是大端序的系统，
通过指定`ieee-be`指定大端序

更应该关注这个：

![example](https://upload-images.jianshu.io/upload_images/10651191-cd39d7b51b88a6c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

指定的精度是:`integer*4`
写入4个字节的整数

也就是说精度那个地方其实是有很多可以选择的值的

![精度](https://upload-images.jianshu.io/upload_images/10651191-73907aee18d3fadf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以这一部分其实就是写入一个精度为`bit1`的数

![](https://upload-images.jianshu.io/upload_images/10651191-a79f274f967b094e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
