---
title: 'DLink固件分析'
date: 2019-01-01
category: 'IOT'
tags: []
lang: 'zh'
draft: true
---
参考 [资料](https://xz.aliyun.com/t/2941#toc-1)

![](https://upload-images.jianshu.io/upload_images/10651191-ddd22f437336880e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

归档到了第11个images

体系架构
![](https://upload-images.jianshu.io/upload_images/10651191-4e11f8c8bed10215.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

制作qemu镜像

![](https://upload-images.jianshu.io/upload_images/10651191-1480a2e5d3bd4a57.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

模拟过程中的网络配置

![](https://upload-images.jianshu.io/upload_images/10651191-44eae1b459dfe31d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
网络配置成功
![](https://upload-images.jianshu.io/upload_images/10651191-2d42a8807c3d8252.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

远程敏感信息读取漏洞

![](https://upload-images.jianshu.io/upload_images/10651191-66b0b277413f9256.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

发现密码就是空。。

然后进入了管理页面

![image.png](https://upload-images.jianshu.io/upload_images/10651191-83c276035324b7e1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
