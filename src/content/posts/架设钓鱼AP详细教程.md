---
title: '架设钓鱼AP详细教程'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
## 1
开启网卡的监听模式

没有网卡的同学可以关掉这个页面了

有了网卡但是kali不能识别的也可以关掉这个页面了

![image.png](https://upload-images.jianshu.io/upload_images/10651191-201a548ef36b7cb0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 使用airbase-ng设置一个钓鱼AP
![image.png](https://upload-images.jianshu.io/upload_images/10651191-f6d8dc43ae36cc09.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实际上设置一个钓鱼AP的过程是很简单的，但是钓鱼AP能不能上网就又是一个问题了

## 在以太网接口和无赖AP之间搭一座桥(完成桥接)
![image.png](https://upload-images.jianshu.io/upload_images/10651191-f667ace6cb685706.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在这之前需要
> apt install bridge-utils

![image.png](https://upload-images.jianshu.io/upload_images/10651191-092325c4663abaf7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里总共有四块网卡

* at0是一块虚拟出来的网卡， 用来做AP， 但是它不能上网
* eth0是一块能够上网的网卡， 但是不能做AP
* lo是环回地址， 也就是127.0.0.1， 现在没啥用
* wlan0mon是开启了监听模式的网卡

所以我们需要把来自at0的流量导入到eth0这一块网卡上。

**至此， 钓鱼AP就已经搭建成功了， 但是你会发现上网速度真的贼鸡儿慢**

## 观察

可以看到有人连接上了
![](https://upload-images.jianshu.io/upload_images/10651191-e2d09add10bc871c.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## happy！
接收到了传出过程中的图片
![](https://upload-images.jianshu.io/upload_images/10651191-7074356519b58d64.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这是我在聊天的时候发出去的图片， 可以看到是两张重叠了

![](https://upload-images.jianshu.io/upload_images/10651191-6f1e443a1fc41e8a.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

还有，
![image.png](https://upload-images.jianshu.io/upload_images/10651191-efe6970595539a96.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 总结
soft AP速度实在是太慢了...
