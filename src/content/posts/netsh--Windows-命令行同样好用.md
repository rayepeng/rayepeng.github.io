---
title: 'netsh--Windows-命令行同样好用'
date: 2019-01-01
category: 'windows'
tags: []
lang: 'zh'
draft: true
---
> 第一次接触到netsh 脚本工具的强大

可以使用交互式的方式， 也可以一次一条命令。

## 显示帮助信息

![netsh](https://upload-images.jianshu.io/upload_images/10651191-2aaa13a00e0267f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 另一种查看帮助的方法

![查看帮助信息](https://upload-images.jianshu.io/upload_images/10651191-da2ea9429e2839f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

也就是接一个命令之后再加一个问号。

## 显示相关的上下文信息
![例子](https://upload-images.jianshu.io/upload_images/10651191-fe5b89cd035ecead.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 查看无线网卡的驱动信息

![查看无线网卡的驱动信息](https://upload-images.jianshu.io/upload_images/10651191-876069d110fc6352.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

从给出的驱动信息中我们可以看到， 我们所用的网卡是不支持承载模式的。

所谓承载模式
-----
(Wireless Hosted Network）是Windows7 和安装有WLAN服务的Windows server 中一项新增的WLAN特性。

通过此特性， Windows计算机能通过一块物理无线网卡，以客户端身份连接到硬AP， 同时又能作为软AP， 允许其他设备与自己连接。
XP，vista里利用传统的临时无线网（即Ad Hoc模式）来实现的，临时无线网（即Ad Hoc模式）是一种点对点网络，类似于有线网中的“双机互联”，虽然也能实现互联网共享，但主要用于两个设备临时互联，并且有的设备（如采用Android系统的设备）并不支持连接到临时无线网。还有一个很严重的问题，由于一块无线网卡只能连接到一个无线网络，因此如果通过无线网卡连接到 Internet，就不能再使用这个无线网卡建立临时网络，共享 Internet 了。而无线承载网络的原理就不一样了。它是通过把物理网卡虚拟一块虚拟网卡，从而模拟软AP的功能。所以当你物理网卡连在真正的无线路由时，可以通过模拟的软AP（软路由）供其他电脑上网。

## 问题

由于我的笔记本电脑自带的无线网卡不能支持承载网络模式， 故使用了新买的USB无线网卡。 

通过命令
> netsh wlan hostednetwork mode=allow ssid=wifi key=12345678  对承载网络进行了相关的设置

执行
> netsh wlan start hostednetwork

![承载网络模式](https://upload-images.jianshu.io/upload_images/10651191-100abf60a2ff9a2e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 最后
 还是出了一点问题， 手机无法连接到承载网络上。

netsh 很容易学习， 基本上多敲几下命令就学会了。 主要还是一些概念很难理解。

---
补充

通过手动配置IP地址。

![手动配置IP地址](https://upload-images.jianshu.io/upload_images/10651191-7ef46ee0a8b7a45b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

有一个问题， 我手动配置的IP地址是192.168.0.1 
但是后来不知道为什么就被修改了。

![连接成功](https://upload-images.jianshu.io/upload_images/10651191-1506913cebf8aec9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

最后显示出我已经连接上了
![image.png](https://upload-images.jianshu.io/upload_images/10651191-7e0953c2d64975a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是手机还是无法上网
