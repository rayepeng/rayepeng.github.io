---
title: '关于websocket协议'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
# 什么是socket？
一个socket是一次网络通信中的一个端点。socket总是分为两部分：一个IP地址和一个端口。

随便访问一个网址，我的计算机都是与网站的服务器使用socket进行通信
一般是URL:80
而我的计算的端口号是任意的

# 关于websocket
传统上，HTTP活动是由客户端请求资源而服务器来提供服务。服务器不能自己与客户端通话。但这个限制已经被新技术WebSocket消除了。

WebSockets提供持久连接，也称为客户端和服务器之间的全双工连接，双方可以随时使用该连接开始发送数据。

# 客户端发送的请求
比如这题：

![](https://upload-images.jianshu.io/upload_images/10651191-a5b9751cc69511dd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
