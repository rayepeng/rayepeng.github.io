---
title: 'pwntools高级应用'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
# 参考
[Pwntools 高级应用](http://brieflyx.me/2015/python-module/pwntools-advanced/#)

到底如何开发pwntools的脚本呢？ 

肯定是需要不断地调试的
pwntools的gdb模块提供了这方面的支持。

> s = process('./pwnme')
context.terminal = ['gnome-terminal', '-x', 'sh', '-c']
gdb.attach(proc.pidof(s)[0])

设置context.terminal ， 同时使用gdb attach上去
proc.pidof(s)[0] 可以获得process的pid

也可以通过这种方式在attach的时候就执行一段gdb命令

> gdb.attach(proc.pidof(s)[0], execute='b *0x400620\nc\n')

这里再记录几个大佬的博客

[brieflyx](http://brieflyx.me/)
![brieflyx](https://upload-images.jianshu.io/upload_images/10651191-2805afb265020507.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[misty](http://misty.moe/)

![misty小窝](https://upload-images.jianshu.io/upload_images/10651191-5e43ef807f515302.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[bestwing](https://bestwing.me/)

![bestwing](https://upload-images.jianshu.io/upload_images/10651191-d4d8c006c81e1318.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

纯粹是为了之后方便找
