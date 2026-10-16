---
title: 'Linux-踩坑记录'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
## 写在前面
连续使用了一周的Linux， 遇到了很多的问题， 一个小白在windows的世界里混惯了， 突然到Linux的世界确实有些不太适应。

 ## 编译内核中出现的问题

### 缺少相关的包

![缺少依赖](https://upload-images.jianshu.io/upload_images/10651191-f8e211a61b76c828.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
使用sudo apt-get install libssl-dev来安装libssl-dev即可，

### 从网上下载文件

使用wget命令
不要养成依赖使用apt 直接傻瓜式安装

学会通过源代码去编译软件， 也是一个很不错的学习过程

至于在Windows中最基本的从网上下载软件的操作， 在Linux世界里也可以通过wget来完成。

-c  可以实现断点续传

可以先在主机上浏览网页， 赋值URL， 之后再使用wget方式进行下载

-O 可以指定保存的文件名

-b  后台下载

### 解压压缩包

tar已经用的很熟练了·

### 权限问题

无脑傻瓜式的用 chmod 777 -R 文件夹

毕竟Linux是一个多用户的操作系统， 所以对权限的划分很敏感
一般为了开发方便， 会直接提供所有权限， 消除一个隐患

### apt 被锁定

sudo rm /var/cache/apt/archives/lock 
sudo rm /var/lib/dpkg/lock 

## 参考资料

[fatal error: openssl opensslv.h: No 解决方案](https://jingyan.baidu.com/article/ea24bc39f72681da62b331d7.html)
[nable to find the ncurses libraries or the
*** required header files.
*** ‘make menuconfig’ requires the ncurses libraries.](
