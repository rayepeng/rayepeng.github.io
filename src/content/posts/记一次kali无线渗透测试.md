---
title: '记一次kali无线渗透测试'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
> 终于找到了一块可以用于kali的无线网卡， 赶紧激动的做一次渗透测试吧

## airmon-ng 命令列出可以使用的网卡
![airmon-ng](https://upload-images.jianshu.io/upload_images/10651191-ec7b2236eaf33428.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![ifconfig](https://upload-images.jianshu.io/upload_images/10651191-986948bf809289dd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## airmon-ng激活无线网络到监听模式

![airmon-ng start](https://upload-images.jianshu.io/upload_images/10651191-0817b4ceccce859d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

不过它提示了我三个可能会影响的进程， 于是果断地kill掉

![airmon-ng kill](https://upload-images.jianshu.io/upload_images/10651191-018d065322adf726.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**此时可以看到无线网卡进入了监听模式**

![wlan0mon](https://upload-images.jianshu.io/upload_images/10651191-ecd18821e20d24e1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## aireplay-ng 测试是否可以注入

![测试是否可以注入](https://upload-images.jianshu.io/upload_images/10651191-92fb730a6939f8aa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 使用airodump-ng wlan0mon定位附近可用的无线网络

![airodump-ng](https://upload-images.jianshu.io/upload_images/10651191-f2be3ce9aca285ed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
