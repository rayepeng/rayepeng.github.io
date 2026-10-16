---
title: '一次PE文件分析的过程'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
## MZ文件头及其DOS stub

![MZ及PE文件头.png](https://upload-images.jianshu.io/upload_images/10651191-bbdb122f15fb1711.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

橘红色的线画出来的是一个很重要的字段， 存储了PE映像头的起始地址。

MZ文件头的大小一般都是40H 个字节， 也就是占用了4行。

> PE view或者ultra edit 这些十六进制的工具中， 都是默认16个字节为一行。 所以我们都习惯了用十六进制来表示某一个字段的大小。 这样方便对应有多少行。

之后的DOS stub小程序的大小其实是不固定的。
所以MZ文件头的最后一个字段就显得很重要了。

## PE映像文件头

![映像文件头.png](https://upload-images.jianshu.io/upload_images/10651191-2055bf54ebc3dd8c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

PE映像文件头分为3个部分

### PE\0\0
这是起始的四个字节， 牢牢记住以下 50 45 这两个十六进制数字， 方便在浏览PE文件的时候进行定位。

### PE NT头
这里存储了一些信息。  4C 01 对应的是x86机器。

E0 00 指明了其后的可选文件头的大小， 这里的PE可选文件头是 14*16个字节。

### PE可选文件头
在该程序中总共是 14*16个字节，也就是从 c8H偏移到 a8H处。

可选文件头中有很多个比较重要的字段。
（但是我不明白为啥把那几个重要的字段隐藏的那么深。。。。让我一顿好找）
可选文件头 偏移 16个字节处 是第一条指令的RVA。
偏移 28个字节处， 是entry point。

记住上面两个就好。
 
## 节表

![节表.png](https://upload-images.jianshu.io/upload_images/10651191-e85318f295c211cc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

首先抛出一个问题， 你怎么知道PE文件有多少个节表？
这个信息是记录在emmm 我好像忘了

关于IDT RVA和 RAW的转换

.rdata 的RVA 为 2000 H
而.rdata 在文件中的偏移为 600H

所以节偏移计算如下：
.text 节偏移：
.rdata 节偏移： 2000 - 600 =   1A00

而IDT的 RVA 为 2014 H
所以 IDT 的文件偏移为 2014 - 1A00 = 0614 H

![引入函数节.png](https://upload-images.jianshu.io/upload_images/10651191-d0d018241fa7c462.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

IDT 分析
![IDT结构](https://upload-images.jianshu.io/upload_images/10651191-f8e1a3289ad50dc6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![引入函数的机制](https://upload-images.jianshu.io/upload_images/10651191-6832802b3b8e1294.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## PE文件相关的实验
使用ollydbg分析PE文件。

![ollydbg打开之后的程序入口](https://upload-images.jianshu.io/upload_images/10651191-e3bfacd6ba2e6c45.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 这里有一个值得记录的事情， 就是我在win10下用ollydbg打开的时候默认进入的第一条指令并不是上图。 程序出现了一些异常， 需要连续按住shift + F8来进行一些跳转才能进入到程序的真正入口处。
