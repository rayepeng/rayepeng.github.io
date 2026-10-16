---
title: 'Linux下如何运行MIPS和ARM虚拟机'
date: 2019-01-01
category: 'IOT'
tags: []
lang: 'zh'
draft: true
---
当然是要用到qemu了

安装qemu的过程不细说

有了qemu之后还需要了解一下其用法，简要来说就是分为使用者模式和另一种不记得名字的模式

使用者模式就是直接通过qemu运行一个非x86的程序

另一种模式就是需要安装一个虚拟机了，（也就是Vmware虚拟机中安装qemu虚拟机

去这个[网站](https://people.debian.org/~aurel32/qemu/)

选择你想要运行的虚拟机，然后下载
推荐使用Linux axel命令行下载
比如要下载armel架构的
可以看到这个网页的底部是有一些说明的：
![说明](https://upload-images.jianshu.io/upload_images/10651191-4b9a3b6cf6a0d065.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
下载需要的然后运行即可

![运行效果](https://upload-images.jianshu.io/upload_images/10651191-39335bb42c6f2f3c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
