---
title: 'B站上的pwn学习'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
![环境](https://upload-images.jianshu.io/upload_images/10651191-bd5feb4d26fe7471.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![使用file查看文件的信息](https://upload-images.jianshu.io/upload_images/10651191-81b04b7965ad6a09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![checksec](https://upload-images.jianshu.io/upload_images/10651191-a4f1451156e2c413.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这就是常见的栈报护了

![](https://upload-images.jianshu.io/upload_images/10651191-46817d406e3a784c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果栈有溢出就会报错

NX no execution 即代码如果在堆和栈上是不可执行的

PIE  如果没开启， 默认从 0x8048000开始运行

输入pwndbg 可以查看特殊的命令

![](https://upload-images.jianshu.io/upload_images/10651191-f12c1f0250bff5e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-5fe0f82cc46ef9ec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-d634b44fcdb72539.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-fb286ca771bbfffa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-792ba4ccfd8420b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# asm 和 disasm

# cyclic

cyclic 100

可以方便地查看覆盖的地址

![](https://upload-images.jianshu.io/upload_images/10651191-b20240edabfbbc1b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# pwn template

直接生成模板
![](https://upload-images.jianshu.io/upload_images/10651191-4263e8099c0eb7af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是这个模板可能有点问题

up主提供的模板

![](https://upload-images.jianshu.io/upload_images/10651191-f200c19b9125d05a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# gdb 命令
![](https://upload-images.jianshu.io/upload_images/10651191-373b1c3a07d10574.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# hexdump

![](https://upload-images.jianshu.io/upload_images/10651191-d0fee3f05a65e502.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# dps

![](https://upload-images.jianshu.io/upload_images/10651191-5362a9081abc5a7b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# ldd 
查看libc的版本

libcdb.com

libc-database

# objdump -R
