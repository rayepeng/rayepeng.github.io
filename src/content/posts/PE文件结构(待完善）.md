---
title: 'PE文件结构(待完善）'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
## IMAGE_DOS_HEADER(MZ文件头)
![](https://upload-images.jianshu.io/upload_images/10651191-01a097ec17bd3e3a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

总共0x40个字节， 也就是前4行

最后一个字段比较重要， 占据了4 个字节
![](https://upload-images.jianshu.io/upload_images/10651191-2fb08ca70bb1e6f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## MS-DOS Stub Program

![](https://upload-images.jianshu.io/upload_images/10651191-4854febe7ec98a33.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## IMAGE_NT_HEADERS

前两个字节标识PE
这一部分的起始地址就是IMAGE_DOS_HEADER的最后一个字段的值  
![](https://upload-images.jianshu.io/upload_images/10651191-6d319163f5643991.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### Signature (占4个字节)
![](https://upload-images.jianshu.io/upload_images/10651191-a793817008a44686.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### IMAGE_FILE_HEADER(占 14H 个字节)
打开这个字段会报错 
![](https://upload-images.jianshu.io/upload_images/10651191-aae16c59e555be5d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

字段分布说明如下
![映像文件头结构](https://upload-images.jianshu.io/upload_images/10651191-d65d185e050aa350.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### IMAGE_OPTIONAL_HEADER 
![](https://upload-images.jianshu.io/upload_images/10651191-6b32ad1d25e2bd34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第一条指令的地址 = Adddress of entry point + Image Base

几个概念

ImageBase
PE文件在内存中的优先装载地址

对齐粒度

问题来了
文件中节对齐的粒度是0x200
内存中节对齐的粒度是0x1000
