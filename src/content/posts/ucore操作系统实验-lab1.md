---
title: 'ucore操作系统实验-lab1'
date: 2019-01-01
category: '操作系统'
tags: []
lang: 'zh'
draft: true
---
# 生成ucore.img 镜像

make "V=" 会显示详细的调试信息

![](https://upload-images.jianshu.io/upload_images/10651191-49aa43ec0ebcbda0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 使用qemu执行并调试lab1中的软件

## 如何单步跟踪BIOS的执行

一般使用qemu-system-i386工具
![](https://upload-images.jianshu.io/upload_images/10651191-a6f654c18744d919.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-aeb9dbe67069e931.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到系统直接启动了， 但是一直在闪屏。。
![](https://upload-images.jianshu.io/upload_images/10651191-2ee9a8eb40c0048d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

那么我们如何结合gdb进行单步调试呢？
![](https://upload-images.jianshu.io/upload_images/10651191-92ed7e75327a461f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

使用qemu -hda ucore.img -parallel stdio

![](https://upload-images.jianshu.io/upload_images/10651191-8ae467461fc27a4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 单步调试的步骤
1. qemu -S -s -hda ucore.img -monitor stdio # 用于与gdb配合进行源码调试

此时qemu进入等待状态

![](https://upload-images.jianshu.io/upload_images/10651191-8b688679e6b1716a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-a427e8b27f722ef1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. gdb 开启远程调试模式
![](https://upload-images.jianshu.io/upload_images/10651191-f8d2aa3e0ae1565e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3.  gdb加载符号信息

![](https://upload-images.jianshu.io/upload_images/10651191-927faaf77468cc59.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-13dbc0a24dc9130c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4. 开始调试

![](https://upload-images.jianshu.io/upload_images/10651191-0f432f4887652787.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-9b1c256b23969ea4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
