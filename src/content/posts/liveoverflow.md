---
title: 'liveoverflow'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
![php](https://upload-images.jianshu.io/upload_images/10651191-97b376c8445efcc7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-479ee445f7b4f9f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

就是传入数组，使得hash_hmac报错，然后返回值是NULL，覆盖掉$secret的值
